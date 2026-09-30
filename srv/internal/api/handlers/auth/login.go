package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/middleware"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/session"
	"github.com/gin-gonic/gin"
)

type LoginIdentifier struct {
	Email *string `json:"email,omitempty" binding:"required_without=Phone,omitempty,email"`
	Phone *string `json:"phone,omitempty" binding:"required_without=Email,omitempty"`
}

type LoginRequest struct {
	Identifier LoginIdentifier `json:"identifier" binding:"required"`
	Password   string          `json:"password"   binding:"required"`
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("login: bad request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	//if logged in already, redirect to /me
	token, err := middleware.SessionToken(c)
	if err == nil {
		_, err := h.q.GetSessionByToken(c, session.Hash(token))
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "already logged in"})
			return
		}
	}

	var user db.User

	if req.Identifier.Email != nil && *req.Identifier.Email != "" {
		user, err = h.q.GetUserByEmail(c, *req.Identifier.Email)
	} else if req.Identifier.Phone != nil && *req.Identifier.Phone != "" {
		user, err = h.q.GetUserByPhoneNumber(c, *req.Identifier.Phone)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email or phone required"})
		return
	}
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	h.q.DeleteExpiredSessionsForUser(c, user.ID)
	token, err = session.New()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to generate token"})
		return
	}

	_, err = h.q.CreateSession(c, db.CreateSessionParams{
		UserID: user.ID,
		Token:  session.Hash(token),
		ExpiresAt: pgtype.Timestamptz{
			Time:  time.Now().Add(7 * 24 * time.Hour),
			Valid: true},
	})
	if err != nil {
		log.Printf("login: create session failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create session"})
		return
	}

	h.setSessionCookie(c, token, 86400*7)

	CommunicationPreference := CommunicationPreference{}
	err = json.Unmarshal(user.Preferences, &CommunicationPreference)
	if err != nil {
		log.Printf("login: failed to unmarshal preferences for user %d: %v", user.ID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to parse user preferences"})
		return
	}

	ResponseUserObject := UserObject{
		ID:          user.ID,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		Preferences: CommunicationPreference,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"user":    ResponseUserObject,
	})
}

func (h *Handler) Logout(c *gin.Context) {
	token, err := middleware.SessionToken(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	h.q.DeleteSession(c, session.Hash(token))
	h.setSessionCookie(c, "", -1)
	c.JSON(http.StatusOK, gin.H{
		"message": "logout successful",
	})
}
