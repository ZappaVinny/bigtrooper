package admin

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (h *Handler) Statistics(c *gin.Context) {
	articleCount, err := h.q.GetArticleCount(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch article count"})
		return
	}

	petCount, err := h.q.GetPetCount(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pet count"})
		return
	}

	userCount, err := h.q.GetUserCount(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"articles": articleCount,
		"pets":     petCount,
		"users":    userCount,
	})
}
