#!/bin/bash
set -a
source .env
set +a

cd api && go run ./cmd/server &
cd web && npm run dev &

wait
