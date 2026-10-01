package api

import (
	"log"
	"os"
	"strings"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api/handlers/admin"
	"github.com/ZappaVinny/bigtrooper/srv/internal/api/handlers/articles"
	"github.com/ZappaVinny/bigtrooper/srv/internal/api/handlers/auth"
	"github.com/ZappaVinny/bigtrooper/srv/internal/api/handlers/health"
	"github.com/ZappaVinny/bigtrooper/srv/internal/api/handlers/pets"
	"github.com/ZappaVinny/bigtrooper/srv/internal/api/middleware"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/storage"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Deps struct {
	Queries *db.Queries
	R2      *storage.R2
}

func NewRouter(d Deps) *gin.Engine {
	r := gin.Default()
	configureClientIP(r)

	origins := splitList(os.Getenv("CORS_ORIGINS"))
	if len(origins) == 0 {
		origins = []string{"http://localhost:5173"}
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	authHandler := auth.New(d.Queries)
	petsHandler := pets.New(d.Queries, d.R2)
	articlesHandler := articles.New(d.Queries)
	adminHandler := admin.New(d.Queries)

	public := r.Group("/api/")
	{
		public.GET("/up", health.Status)
		public.POST("/login", middleware.RateLimit(10, 5), authHandler.Login)
		public.POST("/signup", middleware.RateLimit(5, 3), authHandler.Signup)
		public.GET("/articles", articlesHandler.List)
		public.GET("/articles/:slug", articlesHandler.Get)

		public.GET("/found/:code", middleware.RateLimit(30, 10), petsHandler.GetFound)
		public.POST("/found/:code/report", middleware.RateLimit(5, 3), petsHandler.ReportFound)
	}

	protected := r.Group("/api/")
	protected.Use(middleware.AuthRequired(d.Queries))
	{
		protected.POST("/logout", authHandler.Logout)
		protected.GET("/me", authHandler.Me)
		protected.PATCH("/me", authHandler.UpdateMe)
		protected.POST("/change-password", authHandler.ChangePassword)

		protected.GET("/pets", petsHandler.List)
		protected.POST("/pets", petsHandler.Create)
		protected.GET("/pets/:id", petsHandler.Get)
		protected.PATCH("/pets/:id", petsHandler.Update)
		protected.DELETE("/pets/:id", petsHandler.Delete)

		protected.POST("/pets/:id/image/upload-url", petsHandler.RequestImageUpload)
		protected.PUT("/pets/:id/image", petsHandler.ConfirmImage)
		protected.DELETE("/pets/:id/image", petsHandler.DeleteImage)
	}

	adminGroup := r.Group("/api/admin/")
	adminGroup.Use(middleware.AuthRequired(d.Queries), middleware.AdminRequired())
	{
		adminGroup.GET("/statistics", adminHandler.Statistics)

		adminGroup.GET("/categories", adminHandler.ListCategories)
		adminGroup.GET("/categories/:id", adminHandler.GetCategory)
		adminGroup.POST("/categories", adminHandler.CreateCategory)
		adminGroup.PATCH("/categories/:id", adminHandler.UpdateCategory)
		adminGroup.DELETE("/categories/:id", adminHandler.DeleteCategory)

		adminGroup.GET("/articles", adminHandler.ListArticles)
		adminGroup.GET("/articles/:slug", adminHandler.GetArticle)
		adminGroup.POST("/articles", adminHandler.CreateArticle)
		adminGroup.PATCH("/articles/:slug", adminHandler.UpdateArticle)
		adminGroup.DELETE("/articles/:slug", adminHandler.DeleteArticle)
	}

	return r
}

// configureClientIP decides which proxies may set the client IP, which the
// rate limiter relies on. Configured from .env (see .env.example):
//   - TRUSTED_PLATFORM=cloudflare: take the IP from Cloudflare's CF-Connecting-IP.
//   - TRUSTED_PROXIES=ip,cidr,...: trust X-Forwarded-For only from these proxies.
//   - Neither set: ignore forwarded headers and use the connecting IP (dev default).
func configureClientIP(r *gin.Engine) {
	if strings.EqualFold(strings.TrimSpace(os.Getenv("TRUSTED_PLATFORM")), "cloudflare") {
		r.TrustedPlatform = gin.PlatformCloudflare
	}
	proxies := splitList(os.Getenv("TRUSTED_PROXIES"))
	if err := r.SetTrustedProxies(proxies); err != nil {
		log.Fatalf("invalid TRUSTED_PROXIES %q: %v", proxies, err)
	}
}

func splitList(value string) []string {
	var items []string
	for _, item := range strings.Split(value, ",") {
		if item = strings.TrimSpace(item); item != "" {
			items = append(items, item)
		}
	}
	return items
}
