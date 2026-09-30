package pets

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/middleware"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/storage"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

type Handler struct {
	q  *db.Queries
	r2 *storage.R2
}

func New(q *db.Queries, r2 *storage.R2) *Handler {
	return &Handler{q: q, r2: r2}
}

type PetObject struct {
	ID          int32              `json:"id"`
	OwnerID     int32              `json:"owner_id"`
	Code        string             `json:"code"`
	Name        string             `json:"name"`
	Type        string             `json:"type"`
	Age         int32              `json:"age"`
	Description string             `json:"description"`
	Active      bool               `json:"active"`
	ImageURL    *string            `json:"image_url"`
	CreatedAt   pgtype.Timestamptz `json:"created_at"`
	UpdatedAt   pgtype.Timestamptz `json:"updated_at"`
}

type PetListItem struct {
	ID          int32   `json:"id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Age         int32   `json:"age"`
	Description string  `json:"description"`
	Active      bool    `json:"active"`
	ImageURL    *string `json:"image_url"`
}

func (h *Handler) toPetObject(p db.Pet) PetObject {
	return PetObject{
		ID:          p.ID,
		OwnerID:     p.OwnerID,
		Code:        p.Code,
		Name:        p.Name,
		Type:        p.Type,
		Age:         p.Age,
		Description: p.Description,
		Active:      p.Active,
		ImageURL:    h.imageURL(p.ImageKey),
		CreatedAt:   p.CreatedAt,
		UpdatedAt:   p.UpdatedAt,
	}
}

func (h *Handler) ownedPet(c *gin.Context) (db.Pet, bool) {
	petID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid pet ID"})
		return db.Pet{}, false
	}
	pet, err := h.q.GetPetById(c, int32(petID))
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "pet not found"})
		return db.Pet{}, false
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get pet"})
		return db.Pet{}, false
	}
	if pet.OwnerID != middleware.UserID(c) {
		c.JSON(http.StatusNotFound, gin.H{"error": "pet not found"})
		return db.Pet{}, false
	}
	return pet, true
}

func invalidPetType(c *gin.Context, err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.ConstraintName == "pets_type_check" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pet type must be Dog, Cat, or Other", "field": "type", "issue": "invalid"})
		return true
	}
	return false
}

func (h *Handler) List(c *gin.Context) {
	pets, err := h.q.ListPets(c, middleware.UserID(c))
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
			ImageURL:    h.imageURL(p.ImageKey),
		})
	}
	c.JSON(http.StatusOK, items)
}

type CreatePetRequest struct {
	Name        string `json:"name" binding:"required"`
	Type        string `json:"type" binding:"required"`
	Age         *int32 `json:"age" binding:"required,min=0"`
	Description string `json:"description"`
	Active      bool   `json:"active"`
}

func (h *Handler) Create(c *gin.Context) {
	var req CreatePetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	code, err := h.generateUniqueCode(c)
	if err != nil {
		log.Printf("create pet: generate code: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create pet"})
		return
	}

	pet, err := h.q.CreatePet(c, db.CreatePetParams{
		OwnerID:     middleware.UserID(c),
		Code:        code,
		Name:        req.Name,
		Type:        req.Type,
		Age:         *req.Age,
		Description: req.Description,
		Active:      req.Active,
	})
	if err != nil {
		log.Printf("create pet: %v", err)
		if !invalidPetType(c, err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create pet"})
		}
		return
	}
	c.JSON(http.StatusCreated, h.toPetObject(pet))
}

func (h *Handler) Get(c *gin.Context) {
	pet, ok := h.ownedPet(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, h.toPetObject(pet))
}

type UpdatePetRequest struct {
	Name        *string `json:"name"`
	Type        *string `json:"type"`
	Age         *int32  `json:"age"`
	Description *string `json:"description"`
	Active      *bool   `json:"active"`
}

func (h *Handler) Update(c *gin.Context) {
	existingPet, ok := h.ownedPet(c)
	if !ok {
		return
	}

	var req UpdatePetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
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

	err := h.q.UpdatePet(c, db.UpdatePetParams{
		OwnerID:     existingPet.OwnerID,
		Code:        existingPet.Code,
		Name:        name,
		Type:        petType,
		Age:         age,
		Description: description,
		Active:      active,
		ID:          existingPet.ID,
	})
	if err != nil {
		log.Printf("update pet: %v", err)
		if !invalidPetType(c, err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update pet"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "pet updated"})
}

func (h *Handler) Delete(c *gin.Context) {
	existingPet, ok := h.ownedPet(c)
	if !ok {
		return
	}

	err := h.q.DeletePet(c, existingPet.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to delete pet"})
		return
	}
	if h.r2.Enabled() && existingPet.ImageKey.Valid {
		if err := h.r2.Delete(c, existingPet.ImageKey.String); err != nil {
			log.Printf("delete pet image %s: %v", existingPet.ImageKey.String, err)
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "pet deleted"})
}
