var
  KuzzleSecurityDocument = require('./kuzzleSecurityDocument'),
  KuzzleProfile = require('./kuzzleProfile');

function KuzzleUser(kuzzleSecurity, id, content) {

  KuzzleSecurityDocument.call(this, kuzzleSecurity, id, content);

  // Hydrate user with profile if profile is not only a string but an object with `_id` and `_source`
  if (content.profile && content.profile._id && content.profile._source) {
    content.profile = new KuzzleProfile(kuzzleSecurity, content.profile._id, content.profile._source);
  }

  // Define properties
  Object.defineProperties(this, {
    // private properties
    deleteActionName: {
      value: 'deleteUser'
    },
    updateActionName: {
      value: 'updateUser'
    }
  });

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['hydrate', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

KuzzleUser.prototype = Object.create(KuzzleSecurityDocument.prototype, {
  constructor: {
    value: KuzzleUser
  }
});

/**
 * This function allow to get the hydrated user of the corresponding current user.
 * The hydrated user has profiles and roles.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleUser.prototype.hydrate = function (options, cb) {
  var
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.callbackRequired('KuzzleUser.hydrate', cb);

  if (!this.content.profile || typeof this.content.profile !== 'string') {
    throw new Error('The User must contains a profile as string in order to be hydrated');
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('getProfile'), {_id: this.content.profile}, options, function (error, response) {
    var hydratedUser;

    if (error) {
      return cb(error);
    }

    hydratedUser = new KuzzleUser(self.kuzzleSecurity, self.id, self.content);
    hydratedUser.setProfile(new KuzzleProfile(self.kuzzleSecurity, response.result._id, response.result._source));

    cb(null, hydratedUser);
  });
};

/**
 * Set profile in content
 * @param {KuzzleProfile|string} profile - can be a KuzzleProfile or an id string
 *
 * @returns {KuzzleUser} this
 */
KuzzleUser.prototype.setProfile = function (profile) {

  if (typeof profile !== 'string' && !(profile instanceof KuzzleProfile)) {
    throw new Error('Parameter "profile" must be a KuzzleProfile or a string');
  }

  this.content.profile = profile;

  return this;
};

/**
 * Saves this user into Kuzzle.
 *
 * If this is a new user, this function will create it in Kuzzle.
 * Otherwise, this method will replace the latest version of this user in Kuzzle by the current content
 * of this object.
 *
 * @param {responseCallback} [cb] - Handles the query response
 * @param {object} [options] - Optional parameters
 * @returns {*} this
 */
KuzzleUser.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs('createOrReplaceUser'), data, options, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this User
 */
KuzzleUser.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  if (data.body.profile && data.body.profile.id) {
    data.body.profile = data.body.profile.id;
  }

  return data;
};

module.exports = KuzzleUser;
