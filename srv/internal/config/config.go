package config

import (
	"errors"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL     string
	CookieSecure    bool
	CORSOrigins     []string
	TrustedPlatform string
	TrustedProxies  []string
	R2              R2
}

type R2 struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
}

func (r R2) Configured() bool {
	return r.AccountID != "" && r.AccessKeyID != "" && r.SecretAccessKey != "" &&
		r.Bucket != "" && r.PublicURL != ""
}

func Load() (Config, error) {
	godotenv.Load("../../.env")

	cfg := Config{
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		CookieSecure:    os.Getenv("COOKIE_SECURE") == "true",
		CORSOrigins:     list(os.Getenv("CORS_ORIGINS")),
		TrustedPlatform: strings.ToLower(strings.TrimSpace(os.Getenv("TRUSTED_PLATFORM"))),
		TrustedProxies:  list(os.Getenv("TRUSTED_PROXIES")),
		R2: R2{
			AccountID:       os.Getenv("R2_ACCOUNT_ID"),
			AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
			Bucket:          os.Getenv("R2_BUCKET"),
			PublicURL:       strings.TrimRight(os.Getenv("R2_PUBLIC_URL"), "/"),
		},
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("DATABASE_URL is required")
	}
	if len(cfg.CORSOrigins) == 0 {
		cfg.CORSOrigins = []string{"http://localhost:5173"}
	}
	return cfg, nil
}

func list(value string) []string {
	var items []string
	for _, item := range strings.Split(value, ",") {
		if item = strings.TrimSpace(item); item != "" {
			items = append(items, item)
		}
	}
	return items
}
