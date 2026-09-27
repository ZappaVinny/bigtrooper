package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
)

// respondDBError turns a Postgres constraint violation into a response like
// {"error": "Failed to create article", "field": "slug", "issue": "duplicate"}.
// It returns false when err isn't a constraint violation, so the caller can
// send its own 500.
func respondDBError(c *gin.Context, err error, action string) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}

	// Postgres says which key failed, e.g. Detail
	// `Key (slug)=(my-title) already exists.`
	//This is a shitty error management system, but it works for now.
	field := pgErr.ColumnName
	if start := strings.Index(pgErr.Detail, "Key ("); start != -1 {
		if end := strings.Index(pgErr.Detail[start:], ")="); end != -1 {
			field = pgErr.Detail[start+len("Key (") : start+end]
		}
	}

	message := "Failed to " + action
	switch pgErr.Code {
	case "23505": // unique_violation
		c.JSON(http.StatusConflict, gin.H{"error": message, "field": field, "issue": "duplicate"})
	case "23503": // foreign_key_violation
		// On delete it means other rows still point at this one; otherwise the
		// referenced row doesn't exist.
		if c.Request.Method == http.MethodDelete {
			c.JSON(http.StatusConflict, gin.H{"error": message, "field": field, "issue": "in_use"})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": message, "field": field, "issue": "not_found"})
		}
	case "23502": // not_null_violation
		c.JSON(http.StatusBadRequest, gin.H{"error": message, "field": field, "issue": "required"})
	case "23514": // check_violation, e.g. pets_type_check
		c.JSON(http.StatusBadRequest, gin.H{"error": message, "field": pgErr.ConstraintName, "issue": "invalid"})
	default:
		return false
	}
	return true
}
