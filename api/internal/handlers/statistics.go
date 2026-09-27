package handlers

import (
	"net/http"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
)

func GetStatistics(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		articleCount, err := q.GetArticleCount(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch article count"})
			return
		}

		petCount, err := q.GetPetCount(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pet count"})
			return
		}

		userCount, err := q.GetUserCount(c.Request.Context())
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
}
