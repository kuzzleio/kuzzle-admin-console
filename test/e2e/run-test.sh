#!/bin/bash

adminConsoleHost="localhost"
adminConsolePort="3000"
if [[ -z "$e2eLocal" ]]; then
  adminConsoleHost="adminconsole"
fi

echo
echo " ### Kuzzle Admin Console End to End tests ###"
echo "     ====================================="
echo
echo " Waiting for Kuzzle Admin Connsole to be up at http://$adminConsoleHost:$adminConsolePort"
echo
while ! curl -f -s -o /dev/null "http://$adminConsoleHost:$adminConsolePort"
do
    echo -ne ". "
    sleep 5
done
echo -ne " Let's go!"
echo

set -e

if [[ -z "$updatingVisualReference" ]]; then
  node_modules/.bin/mocha --no-timeouts -R spec -S -b test/e2e/test/*.js
else
  node_modules/.bin/mocha --no-timeouts -R spec -g VISUAL test/e2e/test/*.js

  echo
  echo Copying current screenshots to reference...
  echo
  rsync -av --ignore-existing test/e2e/visual-regression/current/ test/e2e/visual-regression/reference/

  echo Done.
  echo
fi
