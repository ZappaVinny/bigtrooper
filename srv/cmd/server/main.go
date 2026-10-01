package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api"
	"github.com/ZappaVinny/bigtrooper/srv/internal/config"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/storage"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatal("config: ", err)
	}

	pool := connectDB(os.Getenv("DATABASE_URL"))
	defer pool.Close()
	queries := db.New(pool)

	r2, err := storage.New(context.Background(), storage.Settings{
		AccountID:       os.Getenv("CF_ACCOUNT_ID"),
		AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		Bucket:          os.Getenv("R2_BUCKET"),
		PublicURL:       os.Getenv("R2_PUBLIC_URL"),
	})
	if err != nil {
		log.Fatal("failed to set up R2 storage:", err)
	}
	if !r2.Enabled() {
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

	router := api.NewRouter(api.Deps{
		Queries: queries,
		R2:      r2,
	})

	log.Fatal(router.Run("localhost:8080"))
}

func connectDB(databaseURL string) *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal("failed to connect to db:", err)
	}
	return pool
}
