#!/bin/bash

adminConsoleHost="localhost"
adminConsolePort="3000"
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
updatingVisualReference=1 npm run test-visual

echo
echo Copying current screenshots to reference...
echo
rsync -av --ignore-existing visual-regression/current/ visual-regression/reference/

echo Done.
echo
