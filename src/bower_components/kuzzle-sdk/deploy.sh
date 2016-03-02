#! /bin/bash

if [ "${TRAVIS_BRANCH}" = "master"  -a "${TRAVIS_PULL_REQUEST}" = "false" ]
then
  echo "Push generated dist folder"
  git config --global user.email "support@kuzzle.io"
  git config --global user.name "Travis CI"
  git clone --quiet --branch=${TRAVIS_BRANCH} https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG} travis-build
  cd travis-build
  ln -s  ${TRAVIS_BUILD_DIR}/node_modules
  grunt
  git add dist/
  git commit -am "Travis CI - [ci skip] - automatic dist folder"
  git push origin ${TRAVIS_BRANCH}
fi

exit 0
