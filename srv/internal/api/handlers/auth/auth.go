package auth

import (
	"net/http"
	"os"

	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/gin-gonic/gin"
)

const bcryptCost = 12

type Handler struct {
	q *db.Queries
}

func New(q *db.Queries) *Handler {
	return &Handler{q: q}
}

func (h *Handler) setSessionCookie(c *gin.Context, token string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("session_token", token, maxAge, "/", "", os.Getenv("COOKIE_SECURE") == "true", true)
}
