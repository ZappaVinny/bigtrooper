package handlers

import (
	"crypto/rand"
	"errors"
	"math/big"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateUniqueCode(c *gin.Context, q *db.Queries) (string, error) {
	for range 10 {
		code := randomString(5)
		exists, err := q.CodeExists(c, code)
		if err != nil {
			return "", err
		}
		if !exists {
			return code, nil
		}
	}
	return "", errors.New("could not find a free pet code")
}

func randomString(n int) string {
	b := make([]byte, n)
	for i := range b {
		idx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[idx.Int64()]
	}
	return string(b)
}
