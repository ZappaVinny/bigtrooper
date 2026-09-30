package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/session"
	"github.com/gin-gonic/gin"
)

const (
	userIDKey = "user_id"
	adminKey  = "admin"
)

func AuthRequired(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := SessionToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		sess, err := q.GetSessionByToken(c, session.Hash(token))
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, err := q.GetUserById(c, sess.UserID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		c.Set(userIDKey, user.ID)
		setAdminIfPresent(user, c)
		c.Next()
	}
}

func OptionalAuth(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := SessionToken(c)
		if err != nil {
			c.Next()
			return
		}

		sess, err := q.GetSessionByToken(c, session.Hash(token))
		if err != nil {
			c.Next()
			return
		}

		user, err := q.GetUserById(c, sess.UserID)
		if err != nil {
			c.Next()
			return
		}

		c.Set(userIDKey, user.ID)
		setAdminIfPresent(user, c)
		c.Next()
	}
}

func setAdminIfPresent(user db.User, c *gin.Context) {
	if user.Admin {
		c.Set(adminKey, true)
	}
}

// AdminRequired rejects non-admins. It relies on AuthRequired running first
// (which sets "admin" for admin users), so always chain it after that.
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		if _, loggedIn := c.Get(userIDKey); !loggedIn {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		if isAdmin, _ := c.Get(adminKey); isAdmin != true {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "forbidden"})
			return
		}
		c.Next()
	}
}

func UserID(c *gin.Context) int32 {
	id, _ := c.Get(userIDKey)
	userID, _ := id.(int32)
	return userID
}

func SessionToken(c *gin.Context) (string, error) {
	token, err := c.Cookie("session_token")
	if err == nil && token != "" {
		return token, nil
	}
	auth := c.GetHeader("Authorization")
	if strings.HasPrefix(auth, "Bearer ") {
		token = strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))
		if token != "" {
			return token, nil
		}
	}
	return "", errors.New("missing auth token")
}
