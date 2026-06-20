package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
)

const bcryptCost = 12

func Login(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		//if logged in already, redirect to /me
		token, err := getToken(c)
		if err == nil {
			_, err := q.GetSessionByToken(c, token)
			if err == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "already logged in"})
				return
			}
		}

		var user db.User

		if req.Identifier.Email != nil && *req.Identifier.Email != "" {
			user, err = q.GetUserByEmail(c, *req.Identifier.Email)
		} else if req.Identifier.Phone != nil && *req.Identifier.Phone != "" {
			user, err = q.GetUserByPhoneNumber(c, *req.Identifier.Phone)
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

		q.DeleteExpiredSessionsForUser(c, user.ID)
		token, err = generateToken()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to generate token"})
			return
		}

		_, err = q.CreateSession(c, db.CreateSessionParams{
			UserID: user.ID,
			Token:  token,
			ExpiresAt: pgtype.Timestamptz{
				Time:  time.Now().Add(7 * 24 * time.Hour),
				Valid: true},
		})

		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("session_token", token, 86400*7, "/", "", false, true)

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

}
func Logout(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {

		token, err := getToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		q.DeleteSession(c, token)
		c.SetSameSite(http.SameSiteLaxMode)
		c.SetCookie("session_token", "", -1, "/", "", false, true)
		c.JSON(http.StatusOK, gin.H{
			"message": "logout Sucessful",
		})
	}
}

func Signup(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req SignupRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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

		_, err = q.CreateUser(c, db.CreateUserParams{
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

		c.JSON(http.StatusCreated, "signup successful")
	}
}

func ChangePassword(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := c.Get("user_id")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req ChangePasswordRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		user, err := q.GetUserById(c, userID.(int32))
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

		err = q.UpdateUser(c, db.UpdateUserParams{
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

		c.JSON(http.StatusOK, gin.H{"message": "password changed"})
	}
}

func Me(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := c.Get("user_id")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		user, err := q.GetUserById(c, userID.(int32))
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
}

func UpdateMe(q *db.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, ok := c.Get("user_id")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		var req UpdateMeRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		existingUser, err := q.GetUserById(c, userID.(int32))
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

		if req.FirstName != nil {
			updateParams.FirstName = *req.FirstName
		}
		if req.LastName != nil {
			updateParams.LastName = *req.LastName
		}
		if req.Email != nil && *req.Email != existingUser.Email {
			if _, err := q.GetUserByEmail(c, *req.Email); err == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
				return
			}
			updateParams.Email = *req.Email
		}
		if req.PhoneNumber != nil && *req.PhoneNumber != existingUser.PhoneNumber {
			if _, err := q.GetUserByPhoneNumber(c, *req.PhoneNumber); err == nil {
				c.JSON(http.StatusConflict, gin.H{"error": "phone number already in use"})
				return
			}
			updateParams.PhoneNumber = *req.PhoneNumber
		}
		if req.Password != nil {
			hash, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcryptCost)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not hash password"})
				return
			}
			updateParams.Password = string(hash)
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

		if err := q.UpdateUser(c, updateParams); err != nil {
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
}
