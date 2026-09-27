package main

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/ZappaVinny/bigtrooper/api/internal/db"
	"github.com/ZappaVinny/bigtrooper/api/internal/handlers"
	"github.com/ZappaVinny/bigtrooper/api/internal/storage"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	godotenv.Load("../../.env")

	pool := connectDB()
	defer pool.Close()
	queries := db.New(pool)

	store, err := storage.New(context.Background())
	if err != nil {
		log.Fatal("failed to set up R2 storage:", err)
	}
	if store == nil {
		log.Println("R2_* env vars not set; pet photo uploads are disabled")
	}

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
	configureClientIP(r)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins(),
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	public := r.Group("/api/")
	{
		public.GET("/up", handlers.Status)
		public.POST("/login", handlers.RateLimit(10, 5), handlers.Login(queries))
		public.POST("/signup", handlers.RateLimit(5, 3), handlers.Signup(queries))
		public.GET("/articles", handlers.ListPublishedArticles(queries))
		public.GET("/articles/:slug", handlers.GetPublishedArticle(queries))

		// What a pet's QR tag opens. Public, so both are rate-limited.
		public.GET("/found/:code", handlers.RateLimit(30, 10), handlers.GetFoundPet(queries, store))
		public.POST("/found/:code/report", handlers.RateLimit(5, 3), handlers.ReportFoundPet(queries))
	}

	protected := r.Group("/api/")
	protected.Use(handlers.AuthRequired(queries))
	{
		protected.POST("/logout", handlers.Logout(queries))
		protected.GET("/me", handlers.Me(queries))
		protected.PATCH("/me", handlers.UpdateMe(queries))
		protected.POST("/change-password", handlers.ChangePassword(queries))

		protected.GET("/pets", handlers.ListPets(queries, store))
		protected.POST("/pets", handlers.CreatePet(queries, store))
		protected.GET("/pets/:id", handlers.GetPet(queries, store))
		protected.PATCH("/pets/:id", handlers.UpdatePet(queries))
		protected.DELETE("/pets/:id", handlers.DeletePet(queries, store))

		protected.POST("/pets/:id/image/upload-url", handlers.RequestPetImageUpload(queries, store))
		protected.PUT("/pets/:id/image", handlers.ConfirmPetImage(queries, store))
		protected.DELETE("/pets/:id/image", handlers.DeletePetImage(queries, store))
	}

	admin := r.Group("/api/admin/")
	admin.Use(handlers.AuthRequired(queries), handlers.AdminRequired())
	{
		admin.GET("/statistics", handlers.GetStatistics(queries))

		admin.GET("/categories", handlers.ListCategories(queries))
		admin.GET("/categories/:id", handlers.GetCategory(queries))
		admin.POST("/categories", handlers.CreateCategory(queries))
		admin.PATCH("/categories/:id", handlers.UpdateCategory(queries))
		admin.DELETE("/categories/:id", handlers.DeleteCategory(queries))

		admin.GET("/articles", handlers.ListAllArticles(queries))
		admin.GET("/articles/:slug", handlers.GetAnyArticle(queries))
		admin.POST("/articles", handlers.CreateArticle(queries))
		admin.PATCH("/articles/:slug", handlers.UpdateArticle(queries))
		admin.DELETE("/articles/:slug", handlers.DeleteArticle(queries))
	}

	log.Fatal(r.Run("localhost:8080"))
}

// allowedOrigins reads CORS_ORIGINS (comma-separated), defaulting to the
// local Vite dev server.
func allowedOrigins() []string {
	var origins []string
	for _, o := range strings.Split(os.Getenv("CORS_ORIGINS"), ",") {
		if o = strings.TrimSpace(o); o != "" {
			origins = append(origins, o)
		}
	}
	if len(origins) == 0 {
		return []string{"http://localhost:5173"}
	}
	return origins
}

// configureClientIP decides which proxies may set the client IP, which the
// rate limiter relies on. Configured from .env (see .env.example):
//   - TRUSTED_PLATFORM=cloudflare: take the IP from Cloudflare's CF-Connecting-IP.
//   - TRUSTED_PROXIES=ip,cidr,...: trust X-Forwarded-For only from these proxies.
//   - Neither set: ignore forwarded headers and use the connecting IP (dev default).
func configureClientIP(r *gin.Engine) {
	if strings.EqualFold(os.Getenv("TRUSTED_PLATFORM"), "cloudflare") {
		r.TrustedPlatform = gin.PlatformCloudflare
	}

	var proxies []string
	for _, p := range strings.Split(os.Getenv("TRUSTED_PROXIES"), ",") {
		if p = strings.TrimSpace(p); p != "" {
			proxies = append(proxies, p)
		}
	}
	if err := r.SetTrustedProxies(proxies); err != nil {
		log.Fatalf("invalid TRUSTED_PROXIES %q: %v", os.Getenv("TRUSTED_PROXIES"), err)
	}
}

func connectDB() *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	return pool
}
