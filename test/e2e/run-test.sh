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
echo

set -e

cd test/e2e/

if [[ -z "$updatingVisualReference" ]]; then
  ../../node_modules/.bin/cucumber-js
else
  ../../node_modules/.bin/cucumber-js --tags "@visual"

  echo
  echo Copying current screenshots to reference...
  echo
  rsync -av --ignore-existing visual-regression/current/ visual-regression/reference/

  echo Done.
  echo
fi
