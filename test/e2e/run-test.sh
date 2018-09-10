#!/bin/bash

adminConsoleHost="localhost"
adminConsolePort="8080"
if [[ -z "$e2eLocal" ]]; then
  adminConsoleHost="adminconsole"
fi

while ! curl -f -s -o /dev/null "http://$adminConsoleHost:$adminConsolePort"
do
    echo "[$(date --rfc-3339 seconds)] - Waiting for Kuzzle Admin Connsole to be up at http://$adminConsoleHost:$adminConsolePort"
    sleep 5
done

set -e

npm i
npm test
