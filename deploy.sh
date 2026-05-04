#!/usr/bin/env bash
set -Eeuo pipefail

echo "DEPLOYING APPLICATION TRACKER"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$SCRIPT_DIR}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.prod.yml}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: Docker Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

cd "$APP_DIR"

compose=(docker compose --project-directory "$APP_DIR" -f "$COMPOSE_FILE")

if [[ -n "${ENV_FILE:-}" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: ENV_FILE was set but does not exist: $ENV_FILE" >&2
    exit 1
  fi
  compose+=(--env-file "$ENV_FILE")
elif [[ -f "$APP_DIR/.env" ]]; then
  compose+=(--env-file "$APP_DIR/.env")
elif [[ -f "$APP_DIR/.env.local" ]]; then
  compose+=(--env-file "$APP_DIR/.env.local")
else
  echo "WARNING: no .env.local or .env file found in $APP_DIR" >&2
fi

echo "Pulling latest image..."
"${compose[@]}" pull

echo "Restarting services..."
"${compose[@]}" up -d --remove-orphans

echo "Current container status:"
"${compose[@]}" ps

echo "Deployment complete."
