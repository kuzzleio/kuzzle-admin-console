#!/bin/sh

kuzzle=${KUZZLE_HOST:-kuzzle:7511}

while ! curl -m 2 -silent -output /dev/null http://$kuzzle/api/1.0 > /dev/null
do
  echo "$(date) - still trying connecting to http://$kuzzle"
  sleep 1
done
echo "$(date) - successfully connected to Kuzzle"

echo "Installing dependencies..."
npm install

echo "Starting Tests..."
npm run unit
return_value=$?

if [ $return_value -gt 0 ]; then
  mkdir /var/app/dump
  curl -XGET http://elasticsearch:9200/kuzzle-bo-testindex/_search/?size=1000 -o /var/app/dump/kuzzle-bo-testindex.json
  curl -XGET http://elasticsearch:9200/%25kuzzle/_search/?size=1000 -o /var/app/dump/kuzzle.json
fi

exit $return_value
