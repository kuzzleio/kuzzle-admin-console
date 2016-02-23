var
  World,
  fixtures = require('../fixtures.json'),
  config = require('./config.js'),
  Kuzzle = require('kuzzle-sdk'),
  wdio = require('../wdio.conf.js'),

  index = Object.keys(fixtures)[0],
  collections = Object.keys(fixtures[index]),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  documents = {},
  users = {};


// documents['ghopper'] = { ... }
documents[fixtures[index]['kuzzle-bo-test'][0].index._id] = fixtures[index]['kuzzle-bo-test'][1];
// documents['alovelace'] = { ... }
documents[fixtures[index]['kuzzle-bo-test'][2].index._id] = fixtures[index]['kuzzle-bo-test'][3];

users['admin'] = fixtures['%kuzzle']['users'][1];
users['dummy'] = fixtures['%kuzzle']['users'][3];
users['standard'] = fixtures['%kuzzle']['users'][5];
users['firstAdminWithBadPassword'] = {_id: 'firstAdmin', clearPassword: 'test'};
users['firstAdmin'] = {_id: 'firstAdmin', clearPassword: 'testtest'};
users['existingAdmin'] = {_id: fixtures['%kuzzle']['users'][1]._id, clearPassword: 'testtest'};

World = {
  index: index,
  collections: collections,
  currentDocumentId: undefined,
  currentRoom: undefined,
  kuzzleUrl: kuzzleUrl,
  kuzzle: new Kuzzle(kuzzleUrl, { defaultIndex: index }),
  baseUrl: wdio.config.baseUrl,
  documents: documents,
  users: users,
  idPrefix: 'kuzzle-bo-'
};

module.exports = World;
