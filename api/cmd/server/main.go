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

	public := r.Group("/")
	{
		public.GET("/ping", handlers.Status)
		public.POST("/login", handlers.Login(queries))
		public.POST("/signup", handlers.Signup(queries))
	}

	optional := r.Group("/")
	optional.Use(handlers.OptionalAuth(queries))
	{
		// optional.GET("/pets", handlers.GetPets(queries))
		// optional.GET("/profile/:id", handlers.GetPublicProfile(queries))
	}

	protected := r.Group("/")
	protected.Use(handlers.AuthRequired(queries))
	{
		protected.GET("/logout", handlers.Logout(queries))
		protected.GET("/me", handlers.Me(queries))
	}

	// r.GET("/ping", handlers.Status)
	// r.GET("/logout", handlers.Logout) //wip

	// r.POST("/login", handlers.Login(queries))
	// r.POST("/signup", handlers.Signup(queries))

	log.Fatal(r.Run("localhost:8080"))
}

func connectDB() *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	return pool
}
