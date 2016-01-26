var
  World,
  fixtures = require('../fixtures.json'),
  config = require('./config.js'),
  Kuzzle = require('kuzzle-sdk'),
  wdio = require('../wdio.conf.js'),

  index = Object.keys(fixtures)[0],
  collection = Object.keys(fixtures[index])[0],
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  documents = {};


// documents['ghopper'] = { ... }
documents[fixtures[index]['kuzzle-bo-test'][0].index._id] = fixtures[index]['kuzzle-bo-test'][1];
// documents['alovelace'] = { ... }
documents[fixtures[index]['kuzzle-bo-test'][2].index._id] = fixtures[index]['kuzzle-bo-test'][3];


World = {
  index: index,
  collection: collection,
  currentDocumentId: undefined,
  currentRoom: undefined,
  kuzzleUrl: kuzzleUrl,
  kuzzle: new Kuzzle(kuzzleUrl, { defaultIndex: index }),
  baseUrl: wdio.config.baseUrl,
  documents: documents
};

module.exports = World;
