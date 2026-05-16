package handlers

import (
	"crypto/rand"
	"math/big"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateUniqueCode(c *gin.Context, q *db.Queries) string {
	for {
		code := randomString(5)
		exists, _ := q.CodeExists(c, code)
		if !exists {
			return code
		}
	}
}

func randomString(n int) string {
	b := make([]byte, n)
	for i := range b {
		idx, _ := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		b[i] = charset[idx.Int64()]
	}
	return string(b)
}
