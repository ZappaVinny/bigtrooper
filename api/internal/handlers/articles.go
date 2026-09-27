package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
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

func toCategoryObject(cat db.Category) CategoryObject {
	return CategoryObject{
		ID:          cat.ID,
		Name:        cat.Name,
		Description: cat.Description.String,
	}
}

func toListArticleObject(id int32, title, excerpt, slug string, date pgtype.Date, published bool, cat db.Category) ListArticleObject {
	return ListArticleObject{
		ID:        id,
		Title:     title,
		Excerpt:   excerpt,
		Slug:      slug,
		Published: published,
		Date:      date.Time.Format("2006-01-02"),
		Category:  toCategoryObject(cat),
	}
}

func toArticleObject(a db.GetArticleBySlugRow) ArticleObject {
	return ArticleObject{
		ID:        a.ID,
		Title:     a.Title,
		Body:      a.Body,
		Excerpt:   a.Excerpt,
		Date:      a.Date.Time.Format("2006-01-02"),
		Published: a.Published,
		Category:  toCategoryObject(a.Category),
		Slug:      a.Slug,
	}
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
			result = append(result, toListArticleObject(a.ID, a.Title, a.Excerpt, a.Slug, a.Date, a.Published, a.Category))
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
			result = append(result, toListArticleObject(a.ID, a.Title, a.Excerpt, a.Slug, a.Date, a.Published, a.Category))
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
			if !respondDBError(c, err, "create article") {
				c.JSON(500, gin.H{"error": "Failed to create article"})
			}
			return
		}

		fresh, err := q.GetArticleBySlug(c.Request.Context(), article.Slug)
		if err != nil {
			log.Printf("CreateArticle: failed to reload article: %v", err)
			c.JSON(500, gin.H{"error": "Failed to load created article"})
			return
		}
		c.JSON(201, toArticleObject(fresh))
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

		c.JSON(200, toArticleObject(article))
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

		c.JSON(200, toArticleObject(article))
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

		err = q.UpdateArticle(c.Request.Context(), db.UpdateArticleParams{
			ID:         updated.ID,
			Title:      updated.Title,
			Excerpt:    updated.Excerpt,
			Body:       updated.Body,
			Published:  updated.Published,
			CategoryID: updated.CategoryID,
			Date:       updated.Date,
			Slug:       updated.Slug,
		})
		if err != nil {
			log.Printf("UpdateArticle: failed to update article: %v", err)
			if !respondDBError(c, err, "update article") {
				c.JSON(500, gin.H{"error": "Failed to update article"})
			}
			return
		}

		fresh, err := q.GetArticleBySlug(c.Request.Context(), updated.Slug)
		if err != nil {
			log.Printf("UpdateArticle: failed to reload article: %v", err)
			c.JSON(500, gin.H{"error": "Failed to load updated article"})
			return
		}
		c.JSON(200, toArticleObject(fresh))
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
