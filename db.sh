#!/bin/bash
set -a
source .env
set +a

reset_db() {
  migrate -path api/db/migrations -database "$DATABASE_URL" down -all
  migrate -path api/db/migrations -database "$DATABASE_URL" up
}

case "$1" in
  up)   migrate -path api/db/migrations -database "$DATABASE_URL" up ;;
  down) migrate -path api/db/migrations -database "$DATABASE_URL" down -all ;;
  create) migrate create -ext sql -dir api/db/migrations -seq "$2" ;;
  reset) reset_db ;;
  *)    echo "Usage: $0 {up|down|create <name>|reset}" ;;
esac