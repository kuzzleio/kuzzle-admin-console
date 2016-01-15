var
  zombie = require('zombie'),
  fixtures = require('../fixtures.json'),
  config = require('./config.js'),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort;

function World() {
  this.browser = new zombie();
  this.baseUrl = 'http://localhost:3000/';
  this.index = Object.keys(fixtures)[0];
  this.collection = Object.keys(fixtures[this.index])[0];
  this.currentDocumentId = undefined;
  this.currentRoom = undefined;
  this.kuzzle = new Kuzzle(kuzzleUrl, this.index);

  this.visit = function (url, callback) {
    this.browser.visit(this.baseUrl + url, callback);
  };
}

module.exports = function() {
  this.World = World;
};
