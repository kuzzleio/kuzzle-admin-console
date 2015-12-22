var
  zombie = require('zombie'),
  fixtures = require('../fixtures.json');

function World() {
  this.browser = new zombie();
  this.baseUrl = 'http://localhost:3000/';
  this.collection = Object.keys(fixtures)[0];

  this.visit = function (url, callback) {
    this.browser.visit(this.baseUrl + url, callback);
  };
}

module.exports = function() {
  this.World = World;
};