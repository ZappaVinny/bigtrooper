#!/bin/bash
set -a
source .env
set +a

case "$1" in
  up)   migrate -path api/db/migrations -database "$DATABASE_URL" up ;;
  down) migrate -path api/db/migrations -database "$DATABASE_URL" down ;;
  create) migrate create -ext sql -dir api/db/migrations -seq "$2" ;;
  *)    echo "Usage: $0 {up|down|create <name>}" ;;
esac