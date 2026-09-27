package handlers

import (
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func ListCategories(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		categories, err := q.ListCategories(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
			return
		}

		result := make([]CategoryObject, 0, len(categories))

		for _, category := range categories {
			result = append(result, CategoryObject{
				ID:          category.ID,
				Name:        category.Name,
				Description: category.Description.String,
			})
		}

		c.JSON(http.StatusOK, result)
	}
}

func GetCategory(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}
		category, err := q.GetCategory(c.Request.Context(), int32(id))
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
			return
		}

		result := CategoryObject{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description.String,
		}

		c.JSON(http.StatusOK, result)
	}
}

func CreateCategory(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		request := CategoryCreateRequest{}
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		category, err := q.CreateCategory(c.Request.Context(), db.CreateCategoryParams{
			Name: request.Name,
			Description: pgtype.Text{
				String: request.Description,
				Valid:  true,
			},
		})
		if err != nil {
			log.Printf("Error creating category: %v", err)
			if !respondDBError(c, err, "create category") {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
			}
			return
		}

		result := CategoryObject{
			ID:          category.ID,
			Name:        category.Name,
			Description: category.Description.String,
		}

		c.JSON(http.StatusOK, result)
	}
}

func UpdateCategory(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
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
		existing, err := q.GetCategory(c.Request.Context(), int32(id))
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

		err = q.UpdateCategory(c, db.UpdateCategoryParams{
			Name:        updated.Name,
			Description: updated.Description,
			ID:          int32(id),
		})
		if err != nil {
			log.Printf("Error updating category: %v", err)
			if !respondDBError(c, err, "update category") {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
			}
			return
		}

		result := CategoryObject{
			ID:          updated.ID,
			Name:        updated.Name,
			Description: updated.Description.String,
		}

		c.JSON(http.StatusOK, result)
	}
}

func DeleteCategory(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
			return
		}
		if _, err := q.GetCategory(c.Request.Context(), int32(id)); errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
			return
		} else if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category"})
			return
		}
		err = q.DeleteCategory(c.Request.Context(), int32(id))
		if err != nil {
			log.Printf("Error deleting category: %v", err)
			if !respondDBError(c, err, "delete category") {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
			}
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Category deleted"})
	}
}
