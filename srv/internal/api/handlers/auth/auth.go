package auth

import (
	"net/http"

	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/gin-gonic/gin"
)

const bcryptCost = 12

type Handler struct {
	q            *db.Queries
	cookieSecure bool
}

func New(q *db.Queries, cookieSecure bool) *Handler {
	return &Handler{q: q, cookieSecure: cookieSecure}
}

func (h *Handler) setSessionCookie(c *gin.Context, token string, maxAge int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("session_token", token, maxAge, "/", "", h.cookieSecure, true)
}
