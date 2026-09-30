package admin

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/types"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

func (h *Handler) ListCategories(c *gin.Context) {
	categories, err := h.q.ListCategories(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	result := make([]types.CategoryObject, 0, len(categories))

	for _, category := range categories {
		result = append(result, types.CategoryObject{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description.String,
		})
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}
	category, err := h.q.GetCategory(c.Request.Context(), int32(id))
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
		return
	}

	c.JSON(http.StatusOK, types.ToCategoryObject(category))
}

func duplicateCategoryName(c *gin.Context, err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.ConstraintName == "categories_name_key" {
		c.JSON(http.StatusConflict, gin.H{"error": "That category already exists", "field": "name", "issue": "duplicate"})
		return true
	}
	return false
}

type CategoryCreateRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

func (h *Handler) CreateCategory(c *gin.Context) {
	request := CategoryCreateRequest{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	category, err := h.q.CreateCategory(c.Request.Context(), db.CreateCategoryParams{
		Name: request.Name,
		Description: pgtype.Text{
			String: request.Description,
			Valid:  true,
		},
	})
	if err != nil {
		log.Printf("Error creating category: %v", err)
		if !duplicateCategoryName(c, err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		}
		return
	}

	c.JSON(http.StatusCreated, types.ToCategoryObject(category))
}

type CategoryUpdateRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

func (h *Handler) UpdateCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}
	request := CategoryUpdateRequest{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	existing, err := h.q.GetCategory(c.Request.Context(), int32(id))
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
		return
	}
	updated := existing
	if request.Name != nil {
		updated.Name = *request.Name
	}
	if request.Description != nil {
		updated.Description = pgtype.Text{String: *request.Description, Valid: true}
	}

	err = h.q.UpdateCategory(c, db.UpdateCategoryParams{
		Name:        updated.Name,
		Description: updated.Description,
		ID:          int32(id),
	})
	if err != nil {
		log.Printf("Error updating category: %v", err)
		if !duplicateCategoryName(c, err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		}
		return
	}

	c.JSON(http.StatusOK, types.ToCategoryObject(updated))
}

func (h *Handler) DeleteCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}
	if _, err := h.q.GetCategory(c.Request.Context(), int32(id)); errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
		return
	}
	err = h.q.DeleteCategory(c.Request.Context(), int32(id))
	if err != nil {
		log.Printf("Error deleting category: %v", err)
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.ConstraintName == "articles_category_id_fkey" {
			c.JSON(http.StatusConflict, gin.H{"error": "Category is still used by articles", "field": "id", "issue": "in_use"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
}
