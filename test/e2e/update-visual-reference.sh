#!/bin/bash

adminConsoleHost="localhost"
adminConsolePort="3000"
if [[ -z "$e2eLocal" ]]; then
  adminConsoleHost="adminconsole"
fi

echo
echo " ### Kuzzle Admin Console updating visual references ###"
echo "     ==============================================="
echo
echo " Waiting for Kuzzle Admin Connsole to be up at http://$adminConsoleHost:$adminConsolePort"
echo
while ! curl -f -s -o /dev/null "http://$adminConsoleHost:$adminConsolePort"
do
    echo -ne ". "
    sleep 5
done

set -e

updatingVisualReference=1 node_modules/.bin/mocha -no-timeouts -R nyan -g VISUAL

echo
echo Copying current screenshots to reference...
echo
rsync -av --ignore-existing visual-regression/current/ visual-regression/reference/

echo Done.
echo
