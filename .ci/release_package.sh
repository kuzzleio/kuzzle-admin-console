#!/usr/bin/env bash

set -e

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

tar cfz deploy/kuzzle-admin-console_v$PACKAGE_VERSION.tar.gz dist
chmod +r deploy/kuzzle-admin-console_v$PACKAGE_VERSION.tar.gz
