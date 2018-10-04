#!/bin/bash

adminConsoleHost="localhost"
kuzzleHost="localhost"
adminConsolePort="3000"
kuzzlePort="7512"

echo
echo " ### Kuzzle Admin Console End to End tests ###"
echo "     ====================================="
echo

echo " Waiting for Kuzzle to be up at http://$kuzzleHost:$kuzzlePort"
echo
while ! curl -f -s -o /dev/null "http://$kuzzleHost:$kuzzlePort"
do
    echo -ne ". "
    sleep 5
done

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

if [[ -z "$e2eLocal" ]]; then
  $(npm bin)/cypress run --record
else
  $(npm bin)/cypress open
fi
