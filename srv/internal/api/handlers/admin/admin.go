package admin

import "github.com/ZappaVinny/bigtrooper/srv/internal/db"

type Handler struct {
	q *db.Queries
}

func New(q *db.Queries) *Handler {
	return &Handler{q: q}
}
