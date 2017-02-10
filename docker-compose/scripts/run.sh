#!/bin/sh

echo "[$(date --rfc-3339 seconds)] - Starting backoffice server..."
http-server -p ${BACKOFFICE_PORT:=3000} dist/
