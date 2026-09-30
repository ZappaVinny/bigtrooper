package articles

import (
	"net/http"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/types"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	q *db.Queries
}

func New(q *db.Queries) *Handler {
	return &Handler{q: q}
}

func (h *Handler) List(c *gin.Context) {
	articles, err := h.q.ListPublishedArticles(c.Request.Context())
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

func (h *Handler) Get(c *gin.Context) {
	article, err := h.q.GetArticleBySlug(c.Request.Context(), c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	if !article.Published {
		c.JSON(http.StatusNotFound, gin.H{"error": "Article not found"})
		return
	}

	c.JSON(http.StatusOK, types.ToArticleObject(article))
}
