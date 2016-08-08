#!/bin/sh

echo "Installing dependencies..."
npm install
bower install --allow-root

echo "Starting dev server..."
npm run dev