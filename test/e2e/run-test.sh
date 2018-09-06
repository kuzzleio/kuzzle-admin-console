#!/bin/bash

while ! curl -f -s -o /dev/null "http://backoffice:3000"
do
    echo "[$(date --rfc-3339 seconds)] - Waiting for http://backoffice:3000"
    sleep 5
done

set -e

[[ -d /app/output ]] || mkdir /app/output
npm i
npm test
