#!/bin/bash

while ! curl -f -s -o /dev/null "http://backoffice:3000"
do
    echo "[$(date --rfc-3339 seconds)] - Waiting for http://backoffice:3000"
    sleep 5
done

set -e

testim --token $TESTIM_TOKEN --project $TESTIM_PROJECT --host "hub" --browser $BROWSER --label firstAdmin --base-url http://backoffice:3000 --report-file testim-report.xml --config-file /opt/config-file.js
testim --token $TESTIM_TOKEN --project $TESTIM_PROJECT --host "hub" --browser $BROWSER --label normal --base-url http://backoffice:3000 --report-file testim-report.xml --config-file /opt/config-file.js
testim --token $TESTIM_TOKEN --project $TESTIM_PROJECT --host "hub" --browser $BROWSER --label securityUser --base-url http://backoffice:3000 --report-file testim-report.xml --config-file /opt/config-file.js
