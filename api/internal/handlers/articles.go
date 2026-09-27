package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

type ListArticleObject struct {
	ID        int32          `json:"id"`
	Title     string         `json:"title"`
	Excerpt   string         `json:"excerpt"`
	Date      string         `json:"date_published"`
	Published bool           `json:"published"`
	Category  CategoryObject `json:"category"`
	Slug      string         `json:"slug"`
}

func ListAllArticles(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		articles, err := q.ListAllArticles(c.Request.Context())
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch articles"})
			return
		}

		result := make([]ListArticleObject, 0, len(articles))

		for _, a := range articles {
			result = append(result, ListArticleObject{
				ID:        a.ID,
				Title:     a.Title,
				Excerpt:   a.Excerpt,
				Slug:      a.Slug,
				Published: a.Published,
				Date:      a.Date.Time.Format("2006-01-02"),
				Category: CategoryObject{
					ID:          a.Category.ID,
					Name:        a.Category.Name,
					Description: a.Category.Description.String,
				},
			})
		}
		fmt.Println("Articles fetched:", len(result))
		c.JSON(http.StatusOK, result)
	}
}

func ListPublishedArticles(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		articles, err := q.ListPublishedArticles(c.Request.Context())
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch articles"})
			return
		}

		result := make([]ListArticleObject, 0, len(articles))

		for _, a := range articles {
			result = append(result, ListArticleObject{
				ID:        a.ID,
				Title:     a.Title,
				Excerpt:   a.Excerpt,
				Slug:      a.Slug,
				Published: a.Published,
				Date:      a.Date.Time.Format("2006-01-02"),
				Category: CategoryObject{
					ID:          a.Category.ID,
					Name:        a.Category.Name,
					Description: a.Category.Description.String,
				},
			})
		}
		fmt.Println("Articles fetched:", len(result))
		c.JSON(http.StatusOK, result)
	}
}

type ArticleCreateRequest struct {
	Title      string `json:"title" binding:"required"`
	Excerpt    string `json:"excerpt" binding:"required"`
	Body       string `json:"body" binding:"required"`
	Published  bool   `json:"published"`
	CategoryID int32  `json:"category_id" binding:"required"`
	Date       string `json:"date_published"`
}

func CreateArticle(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		request := ArticleCreateRequest{}
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		slug := slug.Make(request.Title)

		dt, err := time.Parse("2006-01-02", request.Date)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid date format"})
			return
		}

		datePublished := pgtype.Date{
			Time:  dt,
			Valid: true,
		}

		article, err := q.CreateArticle(c.Request.Context(), db.CreateArticleParams{
			Title:      request.Title,
			Excerpt:    request.Excerpt,
			Body:       request.Body,
			Published:  request.Published,
			CategoryID: request.CategoryID,
			Date:       datePublished,
			Slug:       slug,
		})
		if err != nil {
			log.Printf("CreateArticle: failed to create article: %v", err)
			// Postgres says which key failed, e.g. Detail
			// `Key (slug)=(my-title) already exists.`
			//This is a shitty error management system, but it works for now.
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				field := pgErr.ColumnName
				if start := strings.Index(pgErr.Detail, "Key ("); start != -1 {
					if end := strings.Index(pgErr.Detail[start:], ")="); end != -1 {
						field = pgErr.Detail[start+len("Key (") : start+end]
					}
				}
				switch pgErr.Code {
				case "23505": // unique_violation
					c.JSON(409, gin.H{"error": "Failed to create article", "field": field, "issue": "duplicate"})
					return
				case "23503": // foreign_key_violation
					c.JSON(400, gin.H{"error": "Failed to create article", "field": field, "issue": "not_found"})
					return
				case "23502": // not_null_violation
					c.JSON(400, gin.H{"error": "Failed to create article", "field": field, "issue": "required"})
					return
				}
			}
			c.JSON(500, gin.H{"error": "Failed to create article"})
			return
		}
		c.JSON(201, article)
	}
}

type ArticleObject struct {
	ID        int32          `json:"id"`
	Title     string         `json:"title"`
	Body      string         `json:"body"`
	Excerpt   string         `json:"excerpt"`
	Date      string         `json:"date_published"`
	Published bool           `json:"published"`
	Category  CategoryObject `json:"category"`
	Slug      string         `json:"slug"`
}

func GetAnyArticle(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")
		article, err := q.GetArticleBySlug(c.Request.Context(), slug)
		if err != nil {
			c.JSON(404, gin.H{"error": "Article not found"})
			return
		}

		result := ArticleObject{
			ID:      article.ID,
			Title:   article.Title,
			Body:    article.Body,
			Excerpt: article.Excerpt,
			Date:    article.Date.Time.Format("2006-01-02"),
			Category: CategoryObject{
				ID:          article.Category.ID,
				Name:        article.Category.Name,
				Description: article.Category.Description.String,
			},
			Slug: article.Slug,
		}
		c.JSON(200, result)
	}
}

func GetPublishedArticle(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")
		article, err := q.GetArticleBySlug(c.Request.Context(), slug)
		if err != nil {
			c.JSON(404, gin.H{"error": "Article not found"})
			return
		}

		if !article.Published {
			c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
			return
		}

		result := ArticleObject{
			ID:      article.ID,
			Title:   article.Title,
			Body:    article.Body,
			Excerpt: article.Excerpt,
			Date:    article.Date.Time.Format("2006-01-02"),
			Category: CategoryObject{
				ID:          article.Category.ID,
				Name:        article.Category.Name,
				Description: article.Category.Description.String,
			},
			Slug: article.Slug,
		}
		c.JSON(200, result)
	}
}

type ArticleUpdateRequest struct {
	Title      *string `json:"title"`
	Excerpt    *string `json:"excerpt"`
	Body       *string `json:"body"`
	Published  *bool   `json:"published"`
	CategoryID *int32  `json:"category_id"`
	Date       *string `json:"date_published"`
}

func UpdateArticle(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		articleSlug := c.Param("slug")
		existing, err := q.GetArticleBySlug(c.Request.Context(), articleSlug)
		if err != nil {
			c.JSON(404, gin.H{"error": "Article not found"})
			return
		}

		request := ArticleUpdateRequest{}
		if err := c.ShouldBindJSON(&request); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		updated := existing

		if request.Title != nil {
			updated.Title = *request.Title
			updated.Slug = slug.Make(*request.Title)
		}
		if request.Excerpt != nil {
			updated.Excerpt = *request.Excerpt
		}
		if request.Body != nil {
			updated.Body = *request.Body
		}
		if request.Published != nil {
			updated.Published = *request.Published
		}
		if request.CategoryID != nil {
			updated.CategoryID = *request.CategoryID
		}
		if request.Date != nil {
			dt, err := time.Parse("2006-01-02", *request.Date)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid date format"})
				return
			}
			updated.Date = pgtype.Date{
				Time:  dt,
				Valid: true,
			}
		}

		createErr := q.UpdateArticle(c.Request.Context(), db.UpdateArticleParams{
			ID:         updated.ID,
			Title:      updated.Title,
			Excerpt:    updated.Excerpt,
			Body:       updated.Body,
			Published:  updated.Published,
			CategoryID: updated.CategoryID,
			Date:       updated.Date,
			Slug:       updated.Slug,
		})
		if createErr != nil {
			log.Printf("UpdateArticle: failed to update article: %v", createErr)
			c.JSON(500, gin.H{"error": "Failed to update article"})
			return
		}

		result := ArticleObject{
			ID:      updated.ID,
			Title:   updated.Title,
			Body:    updated.Body,
			Excerpt: updated.Excerpt,
			Date:    updated.Date.Time.Format("2006-01-02"),
			Category: CategoryObject{
				ID:          updated.Category.ID,
				Name:        updated.Category.Name,
				Description: updated.Category.Description.String,
			},
			Slug: updated.Slug,
		}
		c.JSON(200, result)
	}
}

func DeleteArticle(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		articleSlug := c.Param("slug")
		existing, err := q.GetArticleBySlug(c.Request.Context(), articleSlug)
		if err != nil {
			c.JSON(404, gin.H{"error": "Article not found"})
			return
		}

		err = q.DeleteArticle(c.Request.Context(), existing.ID)
		if err != nil {
			log.Printf("DeleteArticle: failed to delete article: %v", err)
			c.JSON(500, gin.H{"error": "Failed to delete article"})
			return
		}

		c.JSON(200, gin.H{"message": "Article deleted successfully"})
	}
}
