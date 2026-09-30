package pets

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/storage"
	"github.com/gin-gonic/gin"
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

func (h *Handler) imageURL(key pgtype.Text) *string {
	if !h.r2.Enabled() || !key.Valid || key.String == "" {
		return nil
	}
	u := h.r2.PublicURL(key.String)
	return &u
}

func (h *Handler) requireStorage(c *gin.Context) bool {
	if !h.r2.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Photo uploads aren't configured"})
		return false
	}
	return true
}

type PetImageUploadRequest struct {
	ContentType string `json:"content_type" binding:"required"`
	Size        int64  `json:"size"         binding:"required,gt=0"`
}

func (h *Handler) RequestImageUpload(c *gin.Context) {
	if !h.requireStorage(c) {
		return
	}
	pet, ok := h.ownedPet(c)
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

	key := storage.NewKey(fmt.Sprintf("pets/%d", pet.ID), ext)
	url, err := h.r2.PresignPut(c, key, req.ContentType, req.Size, uploadURLLifetime)
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

type PetImageConfirmRequest struct {
	Key string `json:"key" binding:"required"`
}

func (h *Handler) ConfirmImage(c *gin.Context) {
	if !h.requireStorage(c) {
		return
	}
	pet, ok := h.ownedPet(c)
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
	size, contentType, err := h.r2.Head(c, req.Key)
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
		_ = h.r2.Delete(c, req.Key)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Photos must be JPEG, PNG, or WebP and 5 MB or smaller"})
		return
	}

	newKey := pgtype.Text{String: req.Key, Valid: true}
	if err := h.q.SetPetImage(c, db.SetPetImageParams{ImageKey: newKey, ID: pet.ID}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to save photo"})
		return
	}
	if pet.ImageKey.Valid && pet.ImageKey.String != req.Key {
		if err := h.r2.Delete(c, pet.ImageKey.String); err != nil {
			log.Printf("delete old pet image %s: %v", pet.ImageKey.String, err)
		}
	}

	c.JSON(http.StatusOK, gin.H{"image_url": h.imageURL(newKey)})
}

func (h *Handler) DeleteImage(c *gin.Context) {
	if !h.requireStorage(c) {
		return
	}
	pet, ok := h.ownedPet(c)
	if !ok {
		return
	}
	if err := h.q.SetPetImage(c, db.SetPetImageParams{ID: pet.ID}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to remove photo"})
		return
	}
	if pet.ImageKey.Valid {
		if err := h.r2.Delete(c, pet.ImageKey.String); err != nil {
			log.Printf("delete pet image %s: %v", pet.ImageKey.String, err)
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "photo removed"})
}
