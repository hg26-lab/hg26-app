#!/usr/bin/env bash
set -Eeuo pipefail

DB="${DATABASE_PATH:-/var/lib/hg26-app/app.db}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hg26-app}"
TIMESTAMP="$(date -u +'%Y-%m-%dT%H-%M-%SZ')"
BACKUP_FILE="${BACKUP_DIR}/app-${TIMESTAMP}.db"
RETENTION_DAYS=14

if [[ ! -f "$DB" ]]; then
  echo "Database not found: $DB" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

sqlite3 "$DB" ".backup '$BACKUP_FILE'"

if ! sqlite3 "$BACKUP_FILE" "PRAGMA integrity_check;" | grep -qx "ok"; then
  echo "Backup integrity check failed: $BACKUP_FILE" >&2
  rm -f "$BACKUP_FILE"
  exit 1
fi

chmod 640 "$BACKUP_FILE"

find "$BACKUP_DIR" \
  -type f \
  -name 'app-*.db' \
  -mtime +"$RETENTION_DAYS" \
  -delete

echo "Created and verified backup: $BACKUP_FILE"
