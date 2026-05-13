package handlers

import (
	"net/http"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
)

func AuthRequired(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := getToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		session, err := q.GetSessionByToken(c, token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, err := q.GetUserById(c, session.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		c.Set("user_id", user.ID)
		setAdminIfPresent(user, c)
		c.Next()
	}
}

func OptionalAuth(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := getToken(c)
		if err != nil {
			c.Next()
			return
		}

		session, err := q.GetSessionByToken(c, token)
		if err != nil {
			c.Next()
			return
		}

		user, err := q.GetUserById(c, session.UserID)
		if err != nil {
			c.Next()
			return
		}

		c.Set("user_id", user.ID)
		setAdminIfPresent(user, c)
		c.Next()
	}
}

func setAdminIfPresent(user db.User, c *gin.Context) {
	if user.Admin {
		c.Set("admin", true)
	}
}
