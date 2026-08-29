#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="/var/www/app"
APP_USER="hguser26"
PM2_NAME="hg26-app"

cd "$APP_DIR"

echo "Fetching latest code..."
sudo -u "$APP_USER" git fetch origin main

echo "Updating application..."
sudo -u "$APP_USER" git reset --hard origin/main

echo "Installing production dependencies..."
sudo -u "$APP_USER" npm ci --omit=dev

echo "Restarting application..."
sudo -u "$APP_USER" pm2 restart "$APP_DIR/ecosystem.config.js" \
  --only "$PM2_NAME" \
  --update-env

echo "Saving PM2 process list..."
sudo -u "$APP_USER" pm2 save

echo "Deployment completed."
sudo -u "$APP_USER" pm2 status
