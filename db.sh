#!/bin/bash
set -a
source .env
set +a

reset_db() {
  migrate -path srv/db/migrations -database "$DATABASE_URL" down -all
  migrate -path srv/db/migrations -database "$DATABASE_URL" up
}

case "$1" in
  up)   migrate -path srv/db/migrations -database "$DATABASE_URL" up ;;
  down) migrate -path srv/db/migrations -database "$DATABASE_URL" down -all ;;
  create) migrate create -ext sql -dir srv/db/migrations -seq "$2" ;;
  reset) reset_db ;;
  *)    echo "Usage: $0 {up|down|create <name>|reset}" ;;
esac