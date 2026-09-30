package auth

import (
	"encoding/json"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/middleware"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/session"
	"github.com/gin-gonic/gin"
)

// {"communication": {"sms": true, "email": true}}
type CommunicationPreference struct {
	SMS   bool `json:"sms"`
	Email bool `json:"email"`
}

type UserObject struct {
	ID          int32                   `json:"id"`
	FirstName   string                  `json:"first_name"`
	LastName    string                  `json:"last_name"`
	Email       string                  `json:"email"`
	PhoneNumber string                  `json:"phone_number"`
	Preferences CommunicationPreference `json:"preferences"`
	Admin       *bool                   `json:"admin,omitempty"`
}

type SignupRequest struct {
	FirstName   string                  `json:"first_name"   binding:"required,max=100"`
	LastName    string                  `json:"last_name"    binding:"required,max=100"`
	Email       string                  `json:"email"        binding:"required,email,max=254"`
	PhoneNumber string                  `json:"phone_number" binding:"required,max=20"`
	Password    string                  `json:"password"     binding:"required,min=8,max=72"`
	Preferences CommunicationPreference `json:"preferences" binding:"required"`
}

func (h *Handler) Signup(c *gin.Context) {
	var req SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("signup: bad request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcryptCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not hash password"})
		return
	}

	var pref CommunicationPreference
	pref.SMS = req.Preferences.SMS
	pref.Email = req.Preferences.Email

	prefBytes, err := json.Marshal(pref)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not encode preferences"})
		return
	}

	_, err = h.q.CreateUser(c, db.CreateUserParams{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		PhoneNumber: req.PhoneNumber,
		Password:    string(hash),
		Preferences: prefBytes,
	})
	if err != nil {
		log.Printf("signup: create user failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "signup successful"})
}

type ChangePasswordRequest struct {
	NewPassword     string `json:"new_password"     binding:"required,min=8,max=72"`
	CurrentPassword string `json:"current_password"     binding:"required,min=8,max=72"`
}

func (h *Handler) ChangePassword(c *gin.Context) {
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("change password: bad request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	user, err := h.q.GetUserById(c, middleware.UserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get user"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcryptCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not hash password"})
		return
	}

	err = h.q.UpdateUser(c, db.UpdateUserParams{
		ID:          user.ID,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		Password:    string(hash),
		Preferences: user.Preferences,
		Admin:       user.Admin,
	})
	if err != nil {
		log.Printf("change password: update user failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update password"})
		return
	}

	if token, err := middleware.SessionToken(c); err == nil {
		if err := h.q.DeleteOtherSessions(c, db.DeleteOtherSessionsParams{
			UserID: user.ID,
			Token:  session.Hash(token),
		}); err != nil {
			log.Printf("change password: delete other sessions failed: %v", err)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "password changed"})
}

func (h *Handler) Me(c *gin.Context) {
	user, err := h.q.GetUserById(c, middleware.UserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get user"})
		return
	}

	communicationPreference := CommunicationPreference{}
	err = json.Unmarshal(user.Preferences, &communicationPreference)
	if err != nil {
		log.Printf("me: failed to unmarshal preferences for user %d: %v", user.ID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to parse user preferences"})
		return
	}

	ResponseUserObject := UserObject{
		ID:          user.ID,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		PhoneNumber: user.PhoneNumber,
		Preferences: communicationPreference,
		Admin:       &user.Admin,
	}
	c.JSON(http.StatusOK, ResponseUserObject)
}

type UpdateMeRequest struct {
	FirstName       *string                  `json:"first_name"`
	LastName        *string                  `json:"last_name"`
	Email           *string                  `json:"email"        binding:"omitempty,email"`
	PhoneNumber     *string                  `json:"phone_number"`
	Preferences     *CommunicationPreference `json:"preferences"`
	CurrentPassword *string                  `json:"current_password"`
}

func (h *Handler) UpdateMe(c *gin.Context) {
	var req UpdateMeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("update me: bad request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	existingUser, err := h.q.GetUserById(c, middleware.UserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get user"})
		return
	}

	updateParams := db.UpdateUserParams{
		ID:          existingUser.ID,
		FirstName:   existingUser.FirstName,
		LastName:    existingUser.LastName,
		Email:       existingUser.Email,
		PhoneNumber: existingUser.PhoneNumber,
		Password:    existingUser.Password,
		Preferences: existingUser.Preferences,
		Admin:       existingUser.Admin,
	}

	emailChanging := req.Email != nil && *req.Email != existingUser.Email
	phoneChanging := req.PhoneNumber != nil && *req.PhoneNumber != existingUser.PhoneNumber
	if emailChanging || phoneChanging {
		if req.CurrentPassword == nil ||
			bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(*req.CurrentPassword)) != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "current password is incorrect"})
			return
		}
	}

	if req.FirstName != nil {
		updateParams.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		updateParams.LastName = *req.LastName
	}
	if req.Email != nil && *req.Email != existingUser.Email {
		if _, err := h.q.GetUserByEmail(c, *req.Email); err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
			return
		}
		updateParams.Email = *req.Email
	}
	if req.PhoneNumber != nil && *req.PhoneNumber != existingUser.PhoneNumber {
		if _, err := h.q.GetUserByPhoneNumber(c, *req.PhoneNumber); err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": "phone number already in use"})
			return
		}
		updateParams.PhoneNumber = *req.PhoneNumber
	}
	if req.Preferences != nil {
		pref := CommunicationPreference{
			SMS:   req.Preferences.SMS,
			Email: req.Preferences.Email,
		}
		prefBytes, err := json.Marshal(pref)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not encode preferences"})
			return
		}
		updateParams.Preferences = prefBytes
	}

	if err := h.q.UpdateUser(c, updateParams); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update user"})
		return
	}

	communicationPreference := CommunicationPreference{}
	err = json.Unmarshal(updateParams.Preferences, &communicationPreference)
	if err != nil {
		log.Printf("update me: failed to unmarshal preferences for user %d: %v", updateParams.ID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to parse user preferences"})
		return
	}

	c.JSON(http.StatusOK, UserObject{
		ID:          updateParams.ID,
		FirstName:   updateParams.FirstName,
		LastName:    updateParams.LastName,
		Email:       updateParams.Email,
		PhoneNumber: updateParams.PhoneNumber,
		Preferences: communicationPreference,
		Admin:       &updateParams.Admin,
	})
}
