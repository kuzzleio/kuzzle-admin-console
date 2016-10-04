#!/bin/sh
set -e
kuzzle=${KUZZLE_HOST:-kuzzle:7511}

echo "Installing dependencies..."
npm install
bower install --allow-root

echo "Starting Tests..."

Xvfb :10 -ac &
export DISPLAY=:10

# Launch unit tests as soon as possible
npm run unit
return_value=$?

npm run codecov

#if [ $return_value -le 0 ]; then
  #while ! curl -m 2 -silent -output /dev/null http://$kuzzle/api/1.0 > /dev/null
  #do
  # echo "$(date) - still trying connecting to http://$kuzzle"
   #sleep 1
  #done
  #echo "$(date) - successfully connected to Kuzzle"

  #npm run e2e -- --env firefox
 # return_value=$?
#fi

if [ $return_value -gt 0 ]; then
  echo "Tests exited with errors. Dumping the state of the system..."
  mkdir /var/app/dump
  curl -XGET http://elasticsearch:9200/kuzzle-bo-testindex/_search/?size=1000 -o /var/app/dump/kuzzle-bo-testindex.json
  curl -XGET http://elasticsearch:9200/%25kuzzle/_search/?size=1000 -o /var/app/dump/kuzzle.json
fi

echo "Building dist file"
npm run build

echo "Creating archive"
tar -cvf kuzzle-backoffice.tar dist
chmod 777 kuzzle-backoffice.tar

echo "We're done here!"

exit $return_value
