package handlers

import (
	"errors"
	"log"
	"net/http"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/ZappaVinny/bigtrooper/api/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

type FoundPetObject struct {
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Age         int32   `json:"age"`
	Description string  `json:"description"`
	ImageURL    *string `json:"image_url"`
}

type FoundReportRequest struct {
	Email       *string `json:"email"        binding:"omitempty,email,max=254"`
	PhoneNumber *string `json:"phone_number" binding:"omitempty,max=20"`
	Location    *struct {
		Lat float64 `json:"lat" binding:"gte=-90,lte=90"`
		Lng float64 `json:"lng" binding:"gte=-180,lte=180"`
	} `json:"location"`
}

func activePetByCode(c *gin.Context, q *db.Queries) (db.Pet, bool) {
	pet, err := q.GetPetByCode(c, c.Param("code"))
	if errors.Is(err, pgx.ErrNoRows) || (err == nil && !pet.Active) {
		c.JSON(http.StatusNotFound, gin.H{"error": "tag not active"})
		return db.Pet{}, false
	}
	if err != nil {
		log.Printf("found: get pet by code: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to look up tag"})
		return db.Pet{}, false
	}
	return pet, true
}

func GetFoundPet(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		pet, ok := activePetByCode(c, q)
		if !ok {
			return
		}
		c.JSON(http.StatusOK, FoundPetObject{
			Name:        pet.Name,
			Type:        pet.Type,
			Age:         pet.Age,
			Description: pet.Description,
			ImageURL:    imageURL(store, pet.ImageKey),
		})
	}
}

func ReportFoundPet(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req FoundReportRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			log.Printf("found report: bad request: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}
		hasEmail := req.Email != nil && *req.Email != ""
		hasPhone := req.PhoneNumber != nil && *req.PhoneNumber != ""
		if !hasEmail && !hasPhone {
			c.JSON(http.StatusBadRequest, gin.H{"error": "email or phone_number required"})
			return
		}

		pet, ok := activePetByCode(c, q)
		if !ok {
			return
		}

		// !FOUNDPET! STUB: store the report (pet.ID, req.Email,
		// req.PhoneNumber, req.Location) and notify the owner (pet.OwnerID)
		// by email and/or SMS according to their users.preferences. Then
		// respond 201 {"message": "report sent"}.
		_ = pet
		c.JSON(http.StatusNotImplemented, gin.H{"error": "reporting isn't available yet"})
	}
}
