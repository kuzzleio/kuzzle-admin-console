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

set -e

npm i --unsafe-perm
npm test
