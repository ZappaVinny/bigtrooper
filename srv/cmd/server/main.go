package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/ZappaVinny/bigtrooper/srv/internal/api"
	"github.com/ZappaVinny/bigtrooper/srv/internal/config"
	"github.com/ZappaVinny/bigtrooper/srv/internal/db"
	"github.com/ZappaVinny/bigtrooper/srv/internal/service/geo"
	"github.com/ZappaVinny/bigtrooper/srv/internal/storage"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatal("config: ", err)
	}

	if err := sentry.Init(sentry.ClientOptions{
		Dsn:            os.Getenv("SENTRY_DSN"),
		SendDefaultPII: true,
	}); err != nil {
		log.Printf("sentry init: %v", err)
	}
	defer sentry.Flush(2 * time.Second)

	pool := connectDB(os.Getenv("DATABASE_URL"))
	defer pool.Close()
	queries := db.New(pool)

	r2, err := storage.New(context.Background(), storage.Settings{
		AccountID:       os.Getenv("CF_ACCOUNT_ID"),
		AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		Bucket:          os.Getenv("R2_BUCKET"),
		PublicURL:       os.Getenv("R2_IMAGES_PUBLIC_URL"),
	})
	if err != nil {
		fatal("failed to set up R2 storage", err)
	}
	if !r2.Enabled() {
		log.Println("R2_* env vars not set; pet photo uploads are disabled")
	}

	tagsR2 := r2
	if tagsURL := os.Getenv("R2_TAGS_PUBLIC_URL"); tagsURL != "" {
		tagsR2 = r2.WithPublicURL(tagsURL)
	}

	// Build the reverse geocoder (~7s) in the background so the server starts
	// right away and found reports don't pay the load time.
	go func() {
		start := time.Now()
		if err := geo.Load(); err != nil {
			log.Printf("reverse geocoder: %v; found-report emails will omit location", err)
			return
		}
		log.Printf("reverse geocoder ready in %s", time.Since(start).Round(time.Millisecond))
	}()

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
		TagsR2:  tagsR2,
	})

	if err := router.Run("localhost:8080"); err != nil {
		fatal("server stopped", err)
	}
}

func connectDB(databaseURL string) *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		fatal("failed to connect to db", err)
	}
	return pool
}

// fatal is used instead of log.Fatal for any failure after sentry.Init.
// log.Fatal calls os.Exit, which skips deferred calls, so the deferred
// sentry.Flush in main never runs and the error is never sent. This reports
// the error and waits for it to send before exiting. The config.Load failure
// still uses log.Fatal because Sentry isn't set up at that point.
func fatal(msg string, err error) {
	sentry.CaptureException(fmt.Errorf("%s: %w", msg, err))
	sentry.Flush(2 * time.Second)
	log.Fatal(msg, ": ", err)
}
