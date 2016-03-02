function KuzzleSecurityDocument(kuzzleSecurity, id, content) {

  if (!id) {
    throw new Error('A security document must have an id');
  }

  // Define properties
  Object.defineProperties(this, {
    // private properties
    kuzzle: {
      value: kuzzleSecurity.kuzzle
    },
    kuzzleSecurity: {
      value: kuzzleSecurity
    },
    // read-only properties
    // writable properties
    id: {
      value: id,
      enumerable: true
    },
    content: {
      value: {},
      writable: true,
      enumerable: true
    }
  });

  if (content) {
    this.setContent(content, true);
  }

  // promisifying
  if (kuzzleSecurity.kuzzle.bluebird) {
    return kuzzleSecurity.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete', 'update'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }
}

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {Object} data - New securityDocument content
 * @param {boolean} replace - if true: replace this document content with the provided data.
 *
 * @return {Object} this
 */
KuzzleSecurityDocument.prototype.setContent = function (data, replace) {
  var self = this;

  if (replace) {
    this.content = data;
  }
  else {
    Object.keys(data).forEach(function (key) {
      self.content[key] = data[key];
    });
  }

  return this;
};

/**
 * Serialize this object into a pojo
 *
 * @return {object} pojo representing this securityDocument
 */
KuzzleSecurityDocument.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;

  return data;
};

/**
 * Delete the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurityDocument.prototype.delete = function (options, cb) {
  var
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs(this.deleteActionName), {_id: this.id}, options, function (error, res) {
    if (error) {
      return cb ? cb(error) : false;
    }

    if (cb) {
      cb(null, res.result._id);
    }
  });
};

/**
 * Update the current KuzzleSecurityDocument into Kuzzle.
 *
 * @param {object} content - Content to add to KuzzleSecurityDocument
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 */
KuzzleSecurityDocument.prototype.update = function (content, options, cb) {
  var
    data = {},
    self = this;

  if (typeof content !== 'object') {
    throw new Error('Parameter "content" must be a object');
  }

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  data._id = self.id;
  data.body = content;

  self.kuzzle.query(this.kuzzleSecurity.buildQueryArgs(this.updateActionName), data, options, function (error) {
    if (error) {
      return cb ? cb(error) : false;
    }

    self.setContent(content, false);

    if (cb) {
      cb(null, self);
    }
  });
};

module.exports = KuzzleSecurityDocument;