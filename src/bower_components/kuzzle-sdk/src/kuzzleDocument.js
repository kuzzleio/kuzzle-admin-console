/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */

/**
 * Kuzzle handles documents either as realtime messages or as stored documents.
 * KuzzleDocument is the object representation of one of these documents.
 *
 * Notes:
 *   - this constructor may be called either with a documentId, a content, neither or both.
 *   - providing a documentID to the constructor will automatically call refresh, unless a content is also provided
 *
 *
 * @param {object} kuzzleDataCollection - an instanciated KuzzleDataCollection object
 * @param {string} [documentId] - ID of an existing document
 * @param {object} [content] - Initializes this document with the provided content
 * @constructor
 */
function KuzzleDocument(kuzzleDataCollection, documentId, content) {
  Object.defineProperties(this, {
    // read-only properties
    collection: {
      value: kuzzleDataCollection.collection,
      enumerable: true
    },
    dataCollection: {
      value: kuzzleDataCollection,
      enumerable: true
    },
    kuzzle: {
      value: kuzzleDataCollection.kuzzle,
      enumerable: true
    },
    // writable properties
    id: {
      value: undefined,
      enumerable: true,
      writable: true
    },
    content: {
      value: {},
      writable: true,
      enumerable: true
    },
    headers: {
      value: JSON.parse(JSON.stringify(kuzzleDataCollection.headers)),
      enumerable: true,
      writable: true
    },
    version: {
      value: undefined,
      enumerable: true,
      writable: true
    }
  });

  // handling provided arguments
  if (!content && documentId && typeof documentId === 'object') {
    content = documentId;
    documentId = null;
  }

  if (content) {
    if (content._version) {
      this.version = content._version;
      delete content._version;
    }
    this.setContent(content, true);
  }

  if (documentId) {
    Object.defineProperty(this, 'id', {
      value: documentId,
      enumerable: true
    });
  }

  // promisifying
  if (this.kuzzle.bluebird) {
    return this.kuzzle.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['delete', 'refresh', 'save'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

  return this;
}

/**
 * Serialize this object into a JSON object
 *
 * @return {object} JSON object representing this document
 */
KuzzleDocument.prototype.serialize = function () {
  var
    data = {};

  if (this.id) {
    data._id = this.id;
  }

  data.body = this.content;
  data._version = this.version;
  data = this.kuzzle.addHeaders(data, this.headers);

  return data;
};

/**
 * Overrides the toString() method in order to return a serialized version of the document
 *
 * @return {string} serialized version of this object
 */
KuzzleDocument.prototype.toString = function () {
  return JSON.stringify(this.serialize());
};

/**
 * Deletes this document in Kuzzle.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.delete = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!this.id) {
    throw new Error('KuzzleDocument.delete: cannot delete a document without a document ID');
  }

  if (cb) {
    this.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'delete'), this.serialize(), options, function (err) {
      if (err) {
        return cb(err);
      }

      cb(null, self);
    });
  } else {
    this.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'delete'), this.serialize(), options);
  }

  return this;
};

/**
 * Replaces the current content with the last version of this document stored in Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.refresh = function (options, cb) {
  var self = this;

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!self.id) {
    throw new Error('KuzzleDocument.refresh: cannot retrieve a document if no ID has been provided');
  }

  this.kuzzle.callbackRequired('KuzzleDocument.refresh', cb);

  self.kuzzle.query(self.dataCollection.buildQueryArgs('read', 'get'), {_id: self.id}, options, function (error, res) {
    var newDocument;

    if (error) {
      return cb(error);
    }

    newDocument = new KuzzleDocument(self.dataCollection, self.id, res.result._source);
    newDocument.version = res.result._version;

    cb(null, newDocument);
  });
};

/**
 * Saves this document into Kuzzle.
 *
 * If this is a new document, this function will create it in Kuzzle and the id property will be made available.
 * Otherwise, this method will replace the latest version of this document in Kuzzle by the current content
 * of this object.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} [cb] - Handles the query response
 * @returns {*} this
 */
KuzzleDocument.prototype.save = function (options, cb) {
  var
    data = this.serialize(),
    self = this;

  if (options && cb === undefined && typeof options === 'function') {
    cb = options;
    options = null;
  }

  self.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'createOrReplace'), data, options, function (error, res) {
    if (error) {
      return cb ? cb(error) : false;
    }

    self.id = res.result._id;
    self.version = res.result._version;

    if (cb) {
      cb(null, self);
    }
  });

  return self;
};

/**
 * Sends the content of this document as a realtime message.
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} [options] - Optional parameters
 * @returns {*} this
 */
KuzzleDocument.prototype.publish = function (options) {
  var data = this.serialize();

  this.kuzzle.query(this.dataCollection.buildQueryArgs('write', 'publish'), data, options);

  return this;
};

/**
 * Replaces the current content with new data.
 * Changes made by this function won’t be applied until the save method is called.
 *
 * @param {object} data - New content
 * @param {boolean} replace - if true: replace this document content with the provided data
 */
KuzzleDocument.prototype.setContent = function (data, replace) {
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
 * Listens to events concerning this document. Has no effect if the document does not have an ID
 * (i.e. if the document has not yet been created as a persisted document).
 *
 * @param {object} [options] - subscription options
 * @param {responseCallback} cb - callback that will be called each time a change has been detected on this document
 */
KuzzleDocument.prototype.subscribe = function (options, cb) {
  var filters;

  if (options && !cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.kuzzle.callbackRequired('KuzzleDocument.subscribe', cb);

  if (!this.id) {
    throw new Error('KuzzleDocument.subscribe: cannot subscribe to a document if no ID has been provided');
  }

  filters = { ids: { values: [this.id] } };

  return this.dataCollection.subscribe(filters, options, cb);
};

/**
 * Helper function allowing to set headers while chaining calls.
 *
 * If the replace argument is set to true, replace the current headers with the provided content.
 * Otherwise, it appends the content to the current headers, only replacing already existing values
 *
 * @param content - new headers content
 * @param [replace] - default: false = append the content. If true: replace the current headers with tj
 */
KuzzleDocument.prototype.setHeaders = function (content, replace) {
  this.kuzzle.setHeaders.call(this, content, replace);
  return this;
};


module.exports = KuzzleDocument;
