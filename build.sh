#! /bin/bash

export BUILDLOG='./build.log'

echo "Building..."
rimraf dist && webpack --bail --profile --progress -p 2>&1 | tee $BUILDLOG

export FAILURES=$(grep -c "symbol not found" build.log)

if [ $FAILURES -gt 0 ]
then
  echo "======= BUILD FAILED. FORCING REINSTALLATION OF FAILED MODULES: "

  for nodemodule in $(grep 'symbol not found' $BUILDLOG | sed -rn 's/^.*node_modules\/(.*)\/.*$/\1/p' | cut -d '/' -f1)
  do
    echo "===> REINSTALLING: $nodemodule"
    npm install --force $nodemodule
  done

  echo "======= RESTARTING BUILD"
  npm run build
fi
