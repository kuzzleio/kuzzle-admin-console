var
  wd = require('wd'),
  remote = wd.promiseRemote(), // this.browser will be available in step definitions
  fixtures = require('../fixtures.json'),
  config = require('./config.js'),
  Kuzzle = require('kuzzle-sdk'),
  kuzzleUrl = 'http://' + config.kuzzleHost + ':' + config.kuzzlePort,
  q = require('q'),
  fs = require('fs');

// log status output from web driver
if (process.env.DEBUG_PHANTOM) {
  remote.on('status', function(info){
    console.log('\x1b[36m%s\x1b[0m', info);
  });

  // log commands from web driver
  remote.on('command', function(meth, path, data){
    console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
  });
}

exports.World = function World(callback) {
  this.browser = remote;
  this.baseUrl = 'http://localhost:3000/';
  this.index = Object.keys(fixtures)[0];
  this.collection = Object.keys(fixtures[this.index])[0];
  this.currentDocumentId = undefined;
  this.currentRoom = undefined;
  this.kuzzle = new Kuzzle(kuzzleUrl, this.index);

  // run the callback when we are done do cucumber knows we are ready
  this.browser.init({browserName: 'firefox'})
    .then(() => {
      return this.browser.windowSize('current', 1024, 768);
    })
    .then(() => {
      callback();
    });


  /* DEFINE SHORTCUTS */
  this.visit = function (url) {
    return this.browser.get(this.baseUrl + url);
  };

  this.takeScreenshot = function (id) {
    if (!id) {
      id = Math.random();
    }

    return this.browser.takeScreenshot()
      .then((data) => {
        return q.ninvoke(fs, 'writeFile', ['features/screenshots/' + id + '.png', data, 'base64']);
      });
  }
};
