#!/bin/sh

set -e

echo "[$(date --rfc-3339 seconds)] - Installing backoffice dependencies..."
npm install
bower install --allow-root --no-interactive

echo "[$(date --rfc-3339 seconds)] - Starting backoffice unit tests..."
npm run unit

echo "[$(date --rfc-3339 seconds)] - Starting backoffice codecov report..."
npm run codecov

if [ "${TRAVIS_BRANCH}" = "master" ]
then
    echo "[$(date --rfc-3339 seconds)] - Detected to be on master branch"
    echo "[$(date --rfc-3339 seconds)] - Building dist file"
    npm run build
    echo "[$(date --rfc-3339 seconds)] - Creating archive for release"
    tar -cvf kuzzle-backoffice.tar dist
    chmod 777 kuzzle-backoffice.tar
fi

echo "[$(date --rfc-3339 seconds)] - Backoffice tests complete"
