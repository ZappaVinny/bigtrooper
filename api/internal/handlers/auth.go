package handlers

import (
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/gin-gonic/gin"
)

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
				c.Redirect(http.StatusFound, "/me")
				return
			}
		}

		var user db.User

		if req.Email != "" {
			user, err = q.GetUserByEmail(c, req.Email)
		} else {
			user, err = q.GetUserByPhoneNumber(c, req.PhoneNumber)
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to get user"})
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

		c.SetCookie("session_token", token, 86400*7, "/", "", false, true)

		ResponseUserObject := UserObject{
			ID:          user.ID,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Email:       user.Email,
			PhoneNumber: user.PhoneNumber,
			Preferences: user.Preferences,
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "login Sucessful",
			"token":   token,
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

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not hash password"})
			return
		}

		user, err := q.CreateUser(c, db.CreateUserParams{
			FirstName:   req.FirstName,
			LastName:    req.LastName,
			Email:       req.Email,
			PhoneNumber: req.PhoneNumber,
			Password:    string(hash),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to create user",
				"type":  err.Error(),
			})
			return
		}

		ResponseUserObject := UserObject{
			ID:          user.ID,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Email:       user.Email,
			PhoneNumber: user.PhoneNumber,
			Preferences: user.Preferences,
		}

		c.JSON(http.StatusCreated, ResponseUserObject)
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

		ResponseUserObject := UserObject{
			ID:          user.ID,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Email:       user.Email,
			PhoneNumber: user.PhoneNumber,
			Preferences: user.Preferences,
			Admin:       &user.Admin,
		}
		c.JSON(http.StatusOK, ResponseUserObject)
	}
}
