package handlers

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"

	"github.com/gin-gonic/gin"
)

func generateToken() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	return hex.EncodeToString(b), err
}

// hashToken is what the sessions table stores. The cookie carries the raw
// token, so a leaked database can't be used to hijack sessions.
func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func getToken(c *gin.Context) (string, error) {
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
