#!/usr/bin/env bash
set -Eeuo pipefail

echo "DEPLOYING APPLICATION TRACKER"

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ -d "$SCRIPT_DIR/.git" ]]; then
  DEFAULT_APP_DIR="$SCRIPT_DIR"
elif [[ -d "$SCRIPT_DIR/../.git" ]]; then
  DEFAULT_APP_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
else
  DEFAULT_APP_DIR="$SCRIPT_DIR"
fi

APP_DIR="${APP_DIR:-$DEFAULT_APP_DIR}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
COMPOSE_FILE="${COMPOSE_FILE:-$APP_DIR/docker-compose.yml}"

if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "ERROR: APP_DIR is not a git checkout: $APP_DIR" >&2
  echo "Set APP_DIR=/path/to/application_tracker when running this script." >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: Docker Compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi

cd "$APP_DIR"

echo "Pulling latest code from $DEPLOY_BRANCH..."
git fetch origin "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

compose=(docker compose --project-directory "$APP_DIR" -f "$COMPOSE_FILE")

if [[ -n "${ENV_FILE:-}" ]]; then
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "ERROR: ENV_FILE was set but does not exist: $ENV_FILE" >&2
    exit 1
  fi
  compose+=(--env-file "$ENV_FILE")
elif [[ -f "$APP_DIR/.env.local" ]]; then
  compose+=(--env-file "$APP_DIR/.env.local")
elif [[ -f "$APP_DIR/.env" ]]; then
  compose+=(--env-file "$APP_DIR/.env")
else
  echo "WARNING: no .env.local or .env file found in $APP_DIR" >&2
fi

echo "Rebuilding container..."
"${compose[@]}" up -d --build --remove-orphans

echo "Current container status:"
"${compose[@]}" ps

echo "Deployment complete."
