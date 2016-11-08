#!/bin/sh

set -e

echo "[$(date --rfc-3339 seconds)] - Installing backoffice dependencies..."
npm install
bower install --allow-root --no-interactive

echo "[$(date --rfc-3339 seconds)] - Starting backoffice unit tests..."
npm run unit

echo "[$(date --rfc-3339 seconds)] - Backoffice tests complete"
