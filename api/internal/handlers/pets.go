package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/ZappaVinny/bigtrooper/api/internal/storage"
	"github.com/gin-gonic/gin"
)

func toPetObject(store *storage.R2, p db.Pet) PetObject {
	return PetObject{
		ID:          p.ID,
		OwnerID:     p.OwnerID,
		Code:        p.Code,
		Name:        p.Name,
		Type:        p.Type,
		Age:         p.Age,
		Description: p.Description,
		Active:      p.Active,
		ImageURL:    imageURL(store, p.ImageKey),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func ListPets(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		pets, err := q.ListPets(c, userID.(int32))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to list pets"})
			return
		}
		items := make([]PetListItem, 0, len(pets))
		for _, p := range pets {
			items = append(items, PetListItem{
				ID:          p.ID,
				Name:        p.Name,
				Type:        p.Type,
				Age:         p.Age,
				Description: p.Description,
				Active:      p.Active,
				ImageURL:    imageURL(store, p.ImageKey),
			})
		}
		c.JSON(http.StatusOK, items)
	}
}

func CreatePet(q *db.Queries, store *storage.R2) gin.HandlerFunc {

	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req CreatePetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		var code = generateUniqueCode(c, q)

		pet, err := q.CreatePet(c, db.CreatePetParams{
			OwnerID:     userID.(int32),
			Code:        code,
			Name:        req.Name,
			Type:        req.Type,
			Age:         req.Age,
			Description: req.Description,
			Active:      req.Active,
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create pet"})
			return
		}
		c.JSON(http.StatusCreated, toPetObject(store, pet))
	}
}

func GetPet(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		petID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pet ID"})
			return
		}

		pet, err := q.GetPetById(c, int32(petID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get pet"})
			return
		}

		if pet.OwnerID != userID.(int32) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		c.JSON(http.StatusOK, toPetObject(store, pet))
	}
}

func UpdatePet(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		petID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pet ID"})
			return
		}

		var req UpdatePetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
			return
		}

		existingPet, err := q.GetPetById(c, int32(petID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get pet"})
			return
		}

		if existingPet.OwnerID != userID.(int32) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		name := existingPet.Name
		if req.Name != nil {
			name = *req.Name
		}
		petType := existingPet.Type
		if req.Type != nil {
			petType = *req.Type
		}
		age := existingPet.Age
		if req.Age != nil {
			age = *req.Age
		}
		description := existingPet.Description
		if req.Description != nil {
			description = *req.Description
		}
		active := existingPet.Active
		if req.Active != nil {
			active = *req.Active
		}

		err = q.UpdatePet(c, db.UpdatePetParams{
			OwnerID:     existingPet.OwnerID,
			Code:        existingPet.Code,
			Name:        name,
			Type:        petType,
			Age:         age,
			Description: description,
			Active:      active,
			ID:          int32(petID),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update pet"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "pet updated"})
	}
}

func DeletePet(q *db.Queries, store *storage.R2) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		petID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pet ID"})
			return
		}

		existingPet, err := q.GetPetById(c, int32(petID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get pet"})
			return
		}

		if existingPet.OwnerID != userID.(int32) {
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}

		err = q.DeletePet(c, int32(petID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete pet"})
			return
		}
		if store != nil && existingPet.ImageKey.Valid {
			if err := store.Delete(c, existingPet.ImageKey.String); err != nil {
				log.Printf("delete pet image %s: %v", existingPet.ImageKey.String, err)
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "pet deleted"})
	}
}
