#!/usr/bin/env bash

set -e

# Print help if no arguments passed
if [[ "$#" -eq "0" ]]; then
  echo "No arguments supplied, please pass packaging type and plateform."
  echo "Example: ./package_electron.sh compile win32"
  echo "Example: ./package_electron.sh package linux"
  echo "NOTE: Available plateform are win32, darwin and linux"
  exit 1
fi

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

# Package build for the given plateform
function package {
  mkdir deploy
  zip -r deploy/kuzzle-admin-console-v$PACKAGE_VERSION-$1.zip .electron/Kuzzle-Admin-Console-$1-x64/*
}


# Compile Electron application for the given plateform
function compile {
  cp -fr dist/* .electron/
  cd ./.electron && npm install --only=dev
  ./node_modules/.bin/electron-packager . Kuzzle-Admin-Console --electron-version 2.0.8 --platform $1
  cd -
}

if [[ "$1" = "compile" ]]; then
  compile $2
elif [[ "$1" = "package" ]]; then
  package $2
else
  echo "Unknown operation. Only 'compile' and 'package' operations allowed."
if


