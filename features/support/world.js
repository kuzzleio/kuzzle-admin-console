var
  fixtures = require('../fixtures.json'),
  config = require('./config.js'),
  Kuzzle = require('kuzzle-sdk');

var index = Object.keys(fixtures)[0];
var collection = Object.keys(fixtures[index])[0];
var World = {
  index: index,
  collection: collection,
  currentDocumentId: undefined,
  currentRoom: undefined,
  kuzzleUrl: 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  kuzzle: new Kuzzle(World.kuzzleUrl, World.index)
};

module.exports = World;
