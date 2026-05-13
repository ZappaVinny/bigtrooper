package main

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/ZappaVinny/bigtrooper/api/internal/handlers"
	"github.com/gin-gonic/gin"
)



func main() {
	godotenv.Load("../../.env")

	pool := connectDB()
	defer pool.Close()
	queries := db.New(pool)
	r := gin.Default()




	r.GET("/ping", handlers.Status)
	r.GET("/logout", handlers.Logout) //wip
	
	r.POST("/login", handlers.Login(queries))
	r.POST("/signup", handlers.Signup(queries))
	
	
	log.Fatal(r.Run("localhost:8080"))
}







func connectDB() *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	return pool
}