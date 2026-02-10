#!/usr/bin/env bash
set -euo pipefail

# Fixed, foolproof deploy script:
# 1) Upload package to: /root/my-blog.zip
# 2) Run: /root/deploy.sh
#
# Data safety:
# - backup DB before deploy
# - never overwrite backend/data/

APP_DIR="/var/www/my-blog"
ZIP_FILE="/root/my-blog.zip"
TMP_DIR="/tmp/my-blog-release"
PM2_NAME="neon-blog-api"
DB_FILE="$APP_DIR/backend/data/app.db"
BACKUP_DIR="/var/backups/my-blog"
HEALTH_URL="http://127.0.0.1:3000/api/health"

log() {
  echo "[$(date '+%F %T')] $*"
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing command: $1" >&2
    exit 1
  }
}

backup_db() {
  mkdir -p "$BACKUP_DIR"
  if [[ -f "$DB_FILE" ]]; then
    local ts
    ts="$(date +%Y%m%d-%H%M%S)"
    cp -a "$DB_FILE"* "$BACKUP_DIR/" || true
    log "DB backup created at $BACKUP_DIR (tag: $ts)"
  else
    log "DB file not found, skip backup: $DB_FILE"
  fi
}

main() {
  need_cmd unzip
  need_cmd rsync
  need_cmd npm
  need_cmd pm2
  need_cmd curl

  [[ -f "$ZIP_FILE" ]] || {
    echo "Package not found: $ZIP_FILE" >&2
    exit 1
  }

  log "1) Backup database"
  backup_db

  log "2) Unzip package"
  rm -rf "$TMP_DIR"
  mkdir -p "$TMP_DIR"
  unzip -oq "$ZIP_FILE" -d "$TMP_DIR"

  # Support zip with an extra top-level folder.
  if [[ -f "$TMP_DIR/package.json" ]]; then
    SRC="$TMP_DIR"
  else
    SRC="$(find "$TMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n1)"
  fi

  [[ -n "${SRC:-}" && -f "$SRC/package.json" && -f "$SRC/package-lock.json" ]] || {
    echo "Invalid package content (package.json/package-lock.json missing)." >&2
    exit 1
  }

  log "3) Sync files to $APP_DIR"
  mkdir -p "$APP_DIR"
  rsync -av --delete \
    --exclude ".env" \
    --exclude "node_modules" \
    --exclude "backend/data/" \
    "$SRC"/ "$APP_DIR"/

  log "4) Install dependencies"
  cd "$APP_DIR"
  npm ci

  log "5) Restart API with PM2"
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_NAME" --update-env
  else
    pm2 start backend/src/index.js --name "$PM2_NAME" --cwd "$APP_DIR" --update-env
  fi
  pm2 save

  log "6) Health check"
  curl -fsS "$HEALTH_URL" >/dev/null
  log "Deploy completed successfully."
}

main "$@"
