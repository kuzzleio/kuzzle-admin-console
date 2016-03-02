var
  request = require('request'),
  config = require('./config.js'),
  fixtures = require('../fixtures.json'),
  q = require('q'),
  world = require('./world.js');

var hooks = function () {

  this.registerHandler('BeforeFeatures', function (event, callback) {
    browser
      .setViewportSize({width: 1920, height: 1080})
      .call(() => {
        cleanDb(callback);
      });
  });

  this.After('@cleanDb', function (scenario, callback) {
    console.log('@cleanDb');
    cleanDb(callback);
  });

  this.Before('@createFooIndex', function (scenario, callback) {
    console.log('@createFooIndex');

    var
      query = {
        controller: 'admin',
        action: 'createIndex',
        index: world.fooIndex
      },
      timeoutCallback = function () {
        setTimeout(() => {
          callback();
        }, 1000);
      };

    world.kuzzle
      .queryPromise(query, {})
      .then(timeoutCallback)
      .catch(timeoutCallback);
  });

  this.After('@cleanFooIndex', function (scenario, callback) {
    console.log('@cleanFooIndex');

    var
      query = {
        controller: 'admin',
        action: 'deleteIndex',
        index: world.fooIndex
      },
      timeoutCallback = function () {
        setTimeout(() => {
          callback();
        }, 1000);
      };

    world.kuzzle
      .queryPromise(query, {})
      .then(timeoutCallback)
      .catch(timeoutCallback);
  });

  this.After('@cleanSecurity', function (scenario, callback) {
    console.log('@cleanSecurity');
    cleanSecurity.call(this, callback);
  });

  this.Before('@deleteUsers', function (scenario, callback) {
    console.log('@deleteUsers');
    deleteUsers.call(this, callback);
  });

  this.After('@unsubscribe', function (scenario, callback) {
    browser
      .waitForVisible('.filters button.btn-unsubscribe', 1000)
      .click('.filters button.btn-unsubscribe')
      .call(callback);

    if (world.currentRoom) {
      world.currentRoom.unsubscribe();
      world.currentRoom = null;
    }
  });
};

var cleanDb = function (callback) {
  var timeoutCallback = function () {
    setTimeout(function() {
      callback();
    }, 2000);
  };

  removeIndex(function() {
    initIndex(function() {
      bulk()
        .then(timeoutCallback)
        .catch(timeoutCallback);
    });
  });
};

var initIndex = function (callback) {
  var
    query = {
      controller: 'admin',
      action: 'createIndex',
      index: world.index
    },
    timeoutCallback = function () {
      setTimeout(() => {
        callback();
      }, 1000);
    };

  world.kuzzle
    .queryPromise(query, {})
    .then(timeoutCallback)
    .catch(timeoutCallback);
};

var removeIndex = function (callback) {
  var
    query = {
      controller: 'admin',
      action: 'deleteIndex',
      index: world.index
    },
    timeoutCallback = function () {
      setTimeout(() => {
        callback();
      }, 1000);
    };

  world.kuzzle
    .queryPromise(query, {})
    .then(timeoutCallback)
    .catch(timeoutCallback);
};

var bulk = function () {
  var promises = [];

  world.collections.forEach(collection => {
    var query = {
      controller: 'bulk',
      action: 'import',
      index: world.index,
      collection: collection
    };

    promises.push(world.kuzzle.queryPromise(query, {body: fixtures[world.index][collection]}));
  });

  return q.all(promises);
};

var deleteUsers = function (callback) {
   world.kuzzle
    .listIndexesPromise()
    .then(indexes => {
      if (indexes.indexOf('%kuzzle') === -1) {
        return q.reject(new ReferenceError('%kuzzle index not found'));
      }
      return q();
    })
    .then(() => {
      return world.kuzzle
        .security
        .searchUsersPromise({ filter: { regexp: { _uid: 'users.' + world.idPrefix + '.*' } } });
    })
    .then((users) => {
      var passed = 1;

      users.users.forEach(function (user) {
        console.log('deleting',user.id);
        user.delete(function () {
          passed++;
          if (passed === users.total) {
            return q();
          }
        })
      });
    })
    .then(() => {
      setTimeout(function() {callback();}, 1200);
    })
    .catch(error => {
      if (error instanceof ReferenceError && error.message === '%kuzzle index not found') {
        // The %kuzzle index is not created yet. Is not a problem if the tests are run for the first time.
        setTimeout(function() {callback();}, 1200);
     }
      callback(error);
    });
};

var cleanSecurity = function (callback) {
  world.kuzzle
    .listIndexesPromise()
    .then(indexes => {
      if (indexes.indexOf('%kuzzle') === -1) {
        return q.reject(new ReferenceError('%kuzzle index not found'));
      }
    })
    .then(() => {
      return world.kuzzle
        .security
        .searchUsersPromise({ filter: { regexp: { _uid: 'users.' + world.idPrefix + '.*' } } });
    })
    .then((users) => {
      var passed = 1;

      users.users.forEach(function (user) {
        user.delete(function () {
          passed++;
          if (passed === users.total) {
            return q();
          }
        })
      });
    })
    .then(() => {
      var query = {
        controller: 'write',
        action: 'deleteByQuery',
        index: '%kuzzle',
        collection: 'profiles'
      };

      return world.kuzzle
        .queryPromise(query, {body: { filter: { regexp: { _uid: 'profiles.' + world.idPrefix + '.*' } } }});
    })
    .then(() => {
      var query = {
        controller: 'write',
        action: 'deleteByQuery',
        index: '%kuzzle',
        collection: 'roles'
      };

      return world.kuzzle
        .queryPromise(query, {body: {filter: { regexp: { _uid: 'roles.' + world.idPrefix + '.*' } } }});
    })
    .then(() => {
      var query = {
        controller: 'bulk',
        action: 'import',
        index: '%kuzzle',
        collection: 'roles'
      };

      return world.kuzzle
        .queryPromise(query, {body: fixtures['%kuzzle'].roles});
    })
    .then(() => {
      var query = {
        controller: 'bulk',
        action: 'import',
        index: '%kuzzle',
        collection: 'profiles'
      };

      return world.kuzzle
        .queryPromise(query, {body: fixtures['%kuzzle'].profiles});
    })
    .then(() => {
      var passed = 1;

      fixtures['%kuzzle'].users.forEach(function(user) {
        if (user.username) {
          world.kuzzle
            .security
            .createUser(user.username, {password: user.clearPassword, profile: user.profile}, function(error, response) {
              passed++;
              if (passed == (fixtures['%kuzzle'].users.length/2)) {
                return q();
              }
            });
        }
      });
    })  
    .then(() => {
      setTimeout(function() {callback();}, 1200);
    })
    .catch(error => {
      if (error instanceof ReferenceError && error.message === '%kuzzle index not found') {
        // The %kuzzle index is not created yet. Is not a problem if the tests are run for the first time.
        setTimeout(function() {callback();}, 1200);
      }
      callback(error);
    });
};

module.exports = hooks;
