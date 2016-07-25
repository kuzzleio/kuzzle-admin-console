#!/bin/sh

echo "Installing dependencies..."
npm install
bower install

echo "Starting dev server..."
npm run dev