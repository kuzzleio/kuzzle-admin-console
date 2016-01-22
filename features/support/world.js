var
  fixtures = require('../fixtures.json'),
  config = require('./config.js'),
  Kuzzle = require('kuzzle-sdk'),
  wdio = require('../wdio.conf.js'),

  index = Object.keys(fixtures)[0],
  collection = Object.keys(fixtures[index])[0],
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort;

var World = {
  index: index,
  collection: collection,
  currentDocumentId: undefined,
  currentRoom: undefined,
  kuzzleUrl: kuzzleUrl,
  kuzzle: new Kuzzle(kuzzleUrl, index),
  baseUrl: wdio.config.baseUrl
};

module.exports = World;
