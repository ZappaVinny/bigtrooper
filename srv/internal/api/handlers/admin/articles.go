package admin

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/types"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/gin-gonic/gin"
	"github.com/gosimple/slug"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

func articleConstraintError(c *gin.Context, err error) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}
	switch pgErr.ConstraintName {
	case "articles_slug_live_key":
		c.JSON(http.StatusConflict, gin.H{"error": "An article with this title already exists", "field": "title", "issue": "duplicate"})
		return true
	case "articles_category_id_fkey":
		c.JSON(http.StatusBadRequest, gin.H{"error": "That category doesn't exist", "field": "category_id", "issue": "not_found"})
		return true
	}
	return false
}

func (h *Handler) ListArticles(c *gin.Context) {
	articles, err := h.q.ListAllArticles(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch articles"})
		return
	}

	result := make([]types.ListArticleObject, 0, len(articles))

	for _, a := range articles {
		result = append(result, types.ToListArticleObject(a.ID, a.Title, a.Excerpt, a.Slug, a.Date, a.Published, a.Category))
	}
	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetArticle(c *gin.Context) {
	article, err := h.q.GetArticleBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	c.JSON(http.StatusOK, types.ToArticleObject(article))
}

type ArticleCreateRequest struct {
	Title      string `json:"title" binding:"required"`
	Excerpt    string `json:"excerpt" binding:"required"`
	Body       string `json:"body" binding:"required"`
	Published  bool   `json:"published"`
	CategoryID int32  `json:"category_id" binding:"required"`
	Date       string `json:"date_published"`
}

func (h *Handler) CreateArticle(c *gin.Context) {
	request := ArticleCreateRequest{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	slug := slug.Make(request.Title)

	dt, err := time.Parse("2006-01-02", request.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	datePublished := pgtype.Date{
		Time:  dt,
		Valid: true,
	}

	article, err := h.q.CreateArticle(c.Request.Context(), db.CreateArticleParams{
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
		if !articleConstraintError(c, err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create article"})
		}
		return
	}

	fresh, err := h.q.GetArticleBySlug(c.Request.Context(), article.Slug)
	if err != nil {
		log.Printf("CreateArticle: failed to reload article: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load created article"})
		return
	}
	c.JSON(http.StatusCreated, types.ToArticleObject(fresh))
}

type ArticleUpdateRequest struct {
	Title      *string `json:"title"`
	Excerpt    *string `json:"excerpt"`
	Body       *string `json:"body"`
	Published  *bool   `json:"published"`
	CategoryID *int32  `json:"category_id"`
	Date       *string `json:"date_published"`
}

func (h *Handler) UpdateArticle(c *gin.Context) {
	existing, err := h.q.GetArticleBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	request := ArticleUpdateRequest{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		updated.Date = pgtype.Date{
			Time:  dt,
			Valid: true,
		}
	}

	err = h.q.UpdateArticle(c.Request.Context(), db.UpdateArticleParams{
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
		if !articleConstraintError(c, err) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update article"})
		}
		return
	}

	fresh, err := h.q.GetArticleBySlug(c.Request.Context(), updated.Slug)
	if err != nil {
		log.Printf("UpdateArticle: failed to reload article: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated article"})
		return
	}
	c.JSON(http.StatusOK, types.ToArticleObject(fresh))
}

func (h *Handler) DeleteArticle(c *gin.Context) {
	existing, err := h.q.GetArticleBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	err = h.q.DeleteArticle(c.Request.Context(), existing.ID)
	if err != nil {
		log.Printf("DeleteArticle: failed to delete article: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete article"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Article deleted successfully"})
}
