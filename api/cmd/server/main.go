package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/ZappaVinny/bigtrooper/api/internal/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	godotenv.Load("../../.env")

	pool := connectDB()
	defer pool.Close()
	queries := db.New(pool)

	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := queries.DeleteExpiredSessions(context.Background()); err != nil {
				log.Printf("session cleanup: %v", err)
			}
		}
	}()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	public := r.Group("/api/")
	{
		public.GET("/ping", handlers.Status)
		public.POST("/login", handlers.Login(queries))
		public.POST("/signup", handlers.Signup(queries))
	}

	optional := r.Group("/api/")
	optional.Use(handlers.OptionalAuth(queries))
	{

	}

	protected := r.Group("/api/")
	protected.Use(handlers.AuthRequired(queries))
	{
		protected.POST("/logout", handlers.Logout(queries))
		protected.GET("/me", handlers.Me(queries))
		protected.PATCH("/me", handlers.UpdateMe(queries))

		protected.GET("/pets", handlers.ListPets(queries))
		protected.POST("/pets/create", handlers.CreatePet(queries))
		protected.GET("/pets/:id", handlers.GetPet(queries))
		protected.PATCH("/pets/:id", handlers.UpdatePet(queries))
		protected.DELETE("/pets/:id", handlers.DeletePet(queries))
	}
	log.Fatal(r.Run("localhost:8080"))
}

func connectDB() *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	return pool
}
