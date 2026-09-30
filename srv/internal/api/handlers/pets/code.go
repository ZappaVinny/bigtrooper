package pets

import (
	"crypto/rand"
	"errors"
	"math/big"

	"github.com/gin-gonic/gin"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func (h *Handler) generateUniqueCode(c *gin.Context) (string, error) {
	for range 10 {
		code := randomString(5)
		exists, err := h.q.CodeExists(c, code)
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
