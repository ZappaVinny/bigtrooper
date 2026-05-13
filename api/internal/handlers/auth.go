package handlers

import (
	"net/http"

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

		var user db.User
		var err error

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

		c.JSON(http.StatusOK, gin.H{
			"message": "login Sucessful",
			"user":    user,
		})

	}
	
	}

func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "logout",
	})
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
			FirstName:    req.FirstName,
			LastName:     req.LastName,
			Email:        req.Email,
			PhoneNumber:  req.PhoneNumber,
			Password: string(hash),
		})
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to create user",
				"type":  err.Error(),
			})
			return
		}

		c.JSON(http.StatusCreated, user)
	}
}