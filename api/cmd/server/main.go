package main

import (
	"log"
	"net/http"

	"github.com/ZappaVinny/bigtrooper/api/internal/handlers"
	"github.com/gin-gonic/gin"
)


func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})
	
	
	r.GET("/login", handlers.Login)
	r.GET("/logout", handlers.Logout)
	
	
	log.Fatal(r.Run("localhost:8080"))
}