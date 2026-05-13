package handlers

import (
	"crypto/rand"
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
