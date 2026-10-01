package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

func Load() error {
	godotenv.Load("../../.env")

	if os.Getenv("DATABASE_URL") == "" {
		return errors.New("DATABASE_URL is required")
	}
	return nil
}
