var KuzzleSecurityDocument = require('./kuzzleSecurityDocument');

function KuzzleRole(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteRole'
    },
    updateActionName: {
      value: 'updateRole'
    }
  });

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

}

KuzzleRole.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleRole
  }
});

/**
 * Saves this role into Kuzzle.
 *
 * If this is a new role, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this role in Kuzzle by the current content
 * of this object.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleRole.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplaceRole'), data, options, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });
};

module.exports = KuzzleRole;