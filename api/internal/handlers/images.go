package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/ZappaVinny/bigtrooper/api/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// Pet photo uploads: the browser asks for a presigned URL, PUTs the file
// straight to R2, then confirms the key so we can verify and save it.

const (
	maxImageBytes     = 5 << 20 // 5 MB
	uploadURLLifetime = 5 * time.Minute
)

var imageExtensions = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/webp": "webp",
}

// imageURL turns a stored key into a public URL, or nil when there's no image.
func imageURL(store *storage.R2, key pgtype.Text) *string {
	if store == nil || !key.Valid || key.String == "" {
		return nil
	}
	u := store.PublicURL(key.String)
	return &u
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// ownedPet loads the pet in the :id param and checks it belongs to the
// logged-in user, writing the error response itself when it doesn't.
func ownedPet(c *gin.Context, q *db.Queries) (db.Pet, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return db.Pet{}, false
	}
	petID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pet ID"})
		return db.Pet{}, false
	}
	pet, err := q.GetPetById(c, int32(petID))
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "pet not found"})
		return db.Pet{}, false
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get pet"})
		return db.Pet{}, false
	}
	if pet.OwnerID != userID.(int32) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return db.Pet{}, false
	}
	return pet, true
}

func requireStorage(c *gin.Context, store *storage.R2) bool {
	if store == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Photo uploads aren't configured"})
		return false
	}
	return true
}

// RequestPetImageUpload returns how and where the browser should upload a photo.
func RequestPetImageUpload(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !requireStorage(c, store) {
			return
		}
		pet, ok := ownedPet(c, q)
		if !ok {
			return
		}

		var req PetImageUploadRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}
		ext, allowed := imageExtensions[req.ContentType]
		if !allowed {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Photos must be JPEG, PNG, or WebP"})
			return
		}
		if req.Size > maxImageBytes {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Photos must be 5 MB or smaller"})
			return
		}

		key := fmt.Sprintf("pets/%d/%s.%s", pet.ID, randomHex(16), ext)
		url, err := store.PresignPut(c, key, req.ContentType, req.Size, uploadURLLifetime)
		if err != nil {
			log.Printf("presign upload: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to start upload"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"method":     http.MethodPut,
			"upload_url": url,
			"headers":    gin.H{"Content-Type": req.ContentType},
			"key":        key,
			"expires_in": int(uploadURLLifetime.Seconds()),
		})
	}
}

// ConfirmPetImage verifies an uploaded object and makes it the pet's photo.
func ConfirmPetImage(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !requireStorage(c, store) {
			return
		}
		pet, ok := ownedPet(c, q)
		if !ok {
			return
		}

		var req PetImageConfirmRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}
		if !strings.HasPrefix(req.Key, fmt.Sprintf("pets/%d/", pet.ID)) || strings.Contains(req.Key, "..") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid image key"})
			return
		}

		// The object itself is the source of truth: check it really exists and
		// is an acceptable image before saving the key.
		size, contentType, err := store.Head(c, req.Key)
		if errors.Is(err, storage.ErrNotFound) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "upload not found"})
			return
		}
		if err != nil {
			log.Printf("head uploaded image: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to verify upload"})
			return
		}
		if _, allowed := imageExtensions[contentType]; !allowed || size > maxImageBytes {
			_ = store.Delete(c, req.Key)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Photos must be JPEG, PNG, or WebP and 5 MB or smaller"})
			return
		}

		newKey := pgtype.Text{String: req.Key, Valid: true}
		if err := q.SetPetImage(c, db.SetPetImageParams{ImageKey: newKey, ID: pet.ID}); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save photo"})
			return
		}
		if pet.ImageKey.Valid && pet.ImageKey.String != req.Key {
			if err := store.Delete(c, pet.ImageKey.String); err != nil {
				log.Printf("delete old pet image %s: %v", pet.ImageKey.String, err)
			}
		}

		c.JSON(http.StatusOK, gin.H{"image_url": imageURL(store, newKey)})
	}
}

// DeletePetImage removes a pet's photo.
func DeletePetImage(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !requireStorage(c, store) {
			return
		}
		pet, ok := ownedPet(c, q)
		if !ok {
			return
		}
		if err := q.SetPetImage(c, db.SetPetImageParams{ID: pet.ID}); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to remove photo"})
			return
		}
		if pet.ImageKey.Valid {
			if err := store.Delete(c, pet.ImageKey.String); err != nil {
				log.Printf("delete pet image %s: %v", pet.ImageKey.String, err)
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "photo removed"})
	}
}
