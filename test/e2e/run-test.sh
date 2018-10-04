#!/bin/bash

adminConsoleHost="localhost"
kuzzleHost="localhost"
adminConsolePort="3000"
kuzlePort="7512"
if [[ -z "$e2eLocal" ]]; then
  adminConsoleHost="adminconsole"
fi

echo
echo " ### Kuzzle Admin Console End to End tests ###"
echo "     ====================================="
echo

# echo " Waiting for Kuzzle to be up at http://$kuzzleHost:$kuzzleHost"
# echo
# while ! curl -f -s -o /dev/null "http://$kuzzleHost:$kuzzleHost"
# do
#     echo -ne ". "
#     sleep 5
# done

echo
echo -ne " Kuzzle is up!"
echo

echo " Waiting for Kuzzle Admin Console to be up at http://$adminConsoleHost:$adminConsolePort"
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

if [[ -z "$e2eLocal" ]]; then
  ../../node_modules/.bin/cypress run --record
else
  ../../node_modules/.bin/cypress open
fi
