#!/bin/sh

echo "Installing dependencies..."
npm install
bower install --allow-root

echo "Starting prod server..."
npm run server