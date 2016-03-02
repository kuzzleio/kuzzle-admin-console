var
  uuid = require('node-uuid'),
  KuzzleDataCollection = require('./kuzzleDataCollection'),
  KuzzleSecurity = require('./security/kuzzleSecurity'),
  KuzzleUser = require('./security/kuzzleUser');

/**
 * This is a global callback pattern, called by all asynchronous functions of the Kuzzle object.
 *
 * @callback responseCallback
 * @param {Object} err - Error object, NULL if the query is successful
 * @param {Object} data - The content of the query response
 */

/**
 * Kuzzle object constructor.
 * @param url - URL to the Kuzzle instance
 * @param index - Database index
 * @param [options] - Connection options
 * @param {responseCallback} [cb] - Handles connection response
 * @constructor
 */

module.exports = Kuzzle = function (url, options, cb) {
  var self = this;

  if (!(this instanceof Kuzzle)) {
    return new Kuzzle(url, options, cb);
  }

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (!url || url === '') {
    throw new Error('URL argument missing');
  }

  Object.defineProperties(this, {
    // 'private' properties
    collections: {
      value: {},
      writable: true
    },
    connectCB: {
      value: cb
    },
    eventListeners: {
      value: {
        connected: {lastEmitted: null, listeners: []},
        error: {lastEmitted: null, listeners: []},
        disconnected: {lastEmitted: null, listeners: []},
        reconnected: {lastEmitted: null, listeners: []},
        jwtTokenExpired: {lastEmitted: null, listeners: []}
      }
    },
    eventTimeout: {
      value: 200
    },
    io: {
      value: null,
      writable: true
    },
    queuing: {
      value: false,
      writable: true
    },
    requestHistory: {
      value: {},
      writable: true
    },
    socket: {
      value: null,
      writable: true
    },
    state: {
      value: 'initializing',
      writable: true
    },
    subscriptions: {
      /*
       Contains the centralized subscription list in the following format:
          pending: <number of pending subscriptions>
          'roomId': {
            kuzzleRoomID_1: kuzzleRoomInstance_1,
            kuzzleRoomID_2: kuzzleRoomInstance_2,
            kuzzleRoomID_...: kuzzleRoomInstance_...
          }

       This was made to allow multiple subscriptions on the same set of filters, something that Kuzzle does not permit.
       This structure also allows renewing subscriptions after a connection loss
       */
      value: {
        pending: {}
      },
      writable: true
    },
    // read-only properties
    autoReconnect: {
      value: (options && typeof options.autoReconnect === 'boolean') ? options.autoReconnect : true,
      enumerable: true
    },
    defaultIndex: {
      value: (options && typeof options.defaultIndex === 'string') ? options.defaultIndex : undefined,
      writable: true,
      enumerable: true
    },
    reconnectionDelay: {
      value: (options && typeof options.reconnectionDelay === 'number') ? options.reconnectionDelay : 1000,
      enumerable: true
    },
    url: {
      value: url,
      enumerable: true
    },
    autoQueue: {
      value: false,
      enumerable: true,
      writable: true
    },
    autoReplay: {
      value: false,
      enumerable: true,
      writable: true
    },
    autoResubscribe: {
      value: true,
      enumerable: true,
      writable: true
    },
    headers: {
      value: {},
      enumerable: true,
      writable: true
    },
    metadata: {
      value: {},
      enumerable: true,
      writable: true
    },
    /*
      Offline queue use the following format:
            [
              {
                ts: <query timestamp>,
                query: 'query',
                cb: callbackFunction
              }
            ]
     */
    offlineQueue: {
      value: [],
      enumerable: true,
      writable: true
    },
    queueFilter: {
      value: null,
      enumerable: true,
      writable: true
    },
    queueMaxSize: {
      value: 500,
      enumerable: true,
      writable: true
    },
    queueTTL: {
      value: 120000,
      enumerable: true,
      writable: true
    },
    replayInterval: {
      value: 10,
      enumerable: true,
      writable: true
    },
    jwtToken: {
      value: undefined,
      enumerable: true,
      writable: true
    }
  });

  if (typeof window !== 'undefined' && window.io) {
    this.io = window.io;
  } else {
    this.io = require('socket.io-client');
  }

  if (options) {
    Object.keys(options).forEach(function (opt) {
      if (self.hasOwnProperty(opt) && Object.getOwnPropertyDescriptor(self, opt).writable) {
        self[opt] = options[opt];
      }
    });

    if (options.offlineMode === 'auto' && this.autoReconnect) {
      this.autoQueue = this.autoReplay = this.autoResubscribe = true;
    }
  }

  // Helper function ensuring that this Kuzzle object is still valid before performing a query
  Object.defineProperty(this, 'isValid', {
    value: function () {
      if (self.state === 'disconnected') {
        throw new Error('This Kuzzle object has been invalidated. Did you try to access it after a disconnect call?');
      }
    }
  });

  // Helper function copying headers to the query data
  Object.defineProperty(this, 'addHeaders', {
    value: function (query, headers) {
      Object.keys(headers).forEach(function (header) {
        if (!query[header]) {
          query[header] = headers[header];
        }
      });

      return query;
    }
  });

  /**
   * Some methods (mainly read queries) require a callback function. This function exists to avoid repetition of code,
   * and is called by these methods
   */
  Object.defineProperty(this, 'callbackRequired', {
    value: function (errorMessagePrefix, callback) {
      if (!callback || typeof callback !== 'function') {
        throw new Error(errorMessagePrefix + ': a callback argument is required for read queries');
      }
    }
  });

  /**
   * Create an attribute security that embed all methods to manage Role, Profile and User
   */
  Object.defineProperty(this, 'security', {
    value: new KuzzleSecurity(this),
    enumerable: true
  });

  /**
   * Emit an event to all registered listeners
   * An event cannot be emitted multiple times before a timeout has been reached.
   */
  Object.defineProperty(this, 'emitEvent', {
    value: function emitEvent(event) {
      var
        now = Date.now(),
        args = Array.prototype.slice.call(arguments, 1);

      if (this.eventListeners[event].lastEmitted && this.eventListeners[event].lastEmitted >= now - this.eventTimeout) {
        return false;
      }

      this.eventListeners[event].listeners.forEach(function (listener) {
        listener.fn.apply(this, args);
      });

      this.eventListeners[event].lastEmitted = now;
    }
  });


  if (!options || !options.connect || options.connect === 'auto') {
    this.connect();
  } else {
    this.state = 'ready';
  }

  if (this.bluebird) {
    return this.bluebird.promisifyAll(this, {
      suffix: 'Promise',
      filter: function (name, func, target, passes) {
        var whitelist = ['getAllStatistics', 'getServerInfo', 'getStatistics',
          'listCollections', 'listIndexes', 'login', 'logout', 'now', 'query',
          'checkToken', 'whoAmI'];

        return passes && whitelist.indexOf(name) !== -1;
      }
    });
  }

};


/**
 * Connects to a Kuzzle instance using the provided URL.
 * @returns {Object} this
 */
Kuzzle.prototype.connect = function () {
  var self = this;

  if (['initializing', 'ready', 'disconnected', 'error', 'offline'].indexOf(this.state) === -1) {
    if (self.connectCB) {
      self.connectCB(null, self);
    }
    return self;
  }

  self.state = 'connecting';

  self.socket = self.io(self.url, {
    reconnection: self.autoReconnect,
    reconnectionDelay: self.reconnectionDelay,
    forceNew: true
  });

  self.socket.once('connect', function () {
    self.state = 'connected';
    renewAllSubscriptions.call(self);
    dequeue.call(self);
    self.emitEvent('connected');

    if (self.connectCB) {
      self.connectCB(null, self);
    }
  });

  self.socket.on('connect_error', function (error) {
    self.state = 'error';
    self.emitEvent('error');

    if (self.connectCB) {
      self.connectCB(error);
    }
  });

  self.socket.on('disconnect', function () {
    self.state = 'offline';

    if (!self.autoReconnect) {
      self.disconnect();
    }

    if (self.autoQueue) {
      self.queuing = true;
    }

    self.emitEvent('disconnected');
  });

  self.socket.on('reconnect', function () {
    var reconnect = function () {
      // renew subscriptions
      if (self.autoResubscribe) {
        renewAllSubscriptions.call(self);
      }

      // replay queued requests
      if (self.autoReplay) {
        cleanQueue.call(self);
        dequeue.call(self);
      }

      // alert listeners
      self.emitEvent('reconnected');
    };

    self.state = 'connected';

    if (self.jwtToken) {
      self.checkToken(self.jwtToken, function (err, res) {
        // shouldn't obtain an error but let's invalidate the token anyway
        if (err || !res.valid) {
          self.jwtToken = undefined;
          self.emitEvent('jwtTokenExpired');
        }

        reconnect();
      });
    } else {
      reconnect();
    }
  });

  return this;
};

/**
 * Set the jwtToken used to query kuzzle
 * @param token
 * @returns {Kuzzle}
 */
Kuzzle.prototype.setJwtToken = function(token) {
  this.jwtToken = token;
  return this;
};

/**
 * Get the jwtToken used by kuzzle
 * @returns {Kuzzle}
 */
Kuzzle.prototype.getJwtToken = function() {
  return this.jwtToken;
};

/**
 * Send login request to kuzzle with credentials
 * If login success, store the jwtToken into kuzzle object
 *
 * @param strategy
 * @param credentials
 * @param expiresIn
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.login = function (strategy, credentials, expiresIn, cb) {
  var
    self = this,
    request = {
      strategy: strategy
    };

  if (!cb && typeof expiresIn === 'function') {
    cb = expiresIn;
    expiresIn = null;
  }

  Object.keys(credentials).forEach(function (key) {
    request[key] = credentials[key];
  });

  if (['number', 'string'].indexOf(typeof expiresIn) !== -1) {
    request.expiresIn = expiresIn;
  }

  this.query({controller: 'auth', action: 'login'}, {body: request}, {queuable: false}, function(error, response) {
    if (error === null) {
      self.setJwtToken(response.result.jwt);
      renewAllSubscriptions.call(self);

      if (typeof cb === 'function') {
        cb(null, self);
      }
    }
    else if (typeof cb === 'function') {
      cb(error);
    }
    else {
      throw new Error(error.message);
    }
  });

  return self;
};

/**
 * Send logout request to kuzzle with jwtToken.
 *
 * @param cb
 * @returns {Kuzzle}
 */
Kuzzle.prototype.logout = function (cb) {
  var
    self = this,
    request = {
      action: 'logout',
      controller: 'auth',
      requestId: uuid.v4(),
      body: {}
    };

  this.query({controller: 'auth', action: 'logout'}, request, {queuable: false}, function(error) {
    if (error === null) {
      self.setJwtToken(undefined);

      if (typeof cb === 'function') {
        cb(null, self);
      }
    }
    else if (typeof cb === 'function') {
      cb(error);
    }
  });

  return self;
};

/**
 * Checks wether a given jwt token still represents a valid session in Kuzzle.
 *
 * @param  {string}   token     The jwt token to check
 * @param  {function} callback  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 * @return {Kuzzle}             The Kuzzle instance to enable chaining.
 */
Kuzzle.prototype.checkToken = function (token, callback) {
  var
    self = this,
    request = {
      body: {
        token: token
      }
    };

  this.callbackRequired('Kuzzle.checkToken', callback);

  this.query({controller: 'auth', action: 'checkToken'}, request, {queuable: false}, function (err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, response.result);
  });

  return self;
};

/**
 * Fetches the current user.
 *
 * @param  {function} callback  The callback to be called when the response is
 *                              available. The signature is `function(error, response)`.
 * @return {Kuzzle}             The Kuzzle instance to enable chaining.
 */
Kuzzle.prototype.whoAmI = function (callback) {
  var self = this;

  self.callbackRequired('Kuzzle.whoAmI', callback);

  self.query({controller: 'auth', action: 'getCurrentUser'}, {}, {}, function (err, response) {
    if (err) {
      return callback(err);
    }

    callback(null, new KuzzleUser(self.security, response.result._id, response.result._source));
  });

  return self;
};
/**
 * Clean up the queue, ensuring the queryTTL and queryMaxSize properties are respected
 */
function cleanQueue () {
  var
    self = this,
    now = Date.now(),
    lastDocumentIndex = -1;

  if (self.queueTTL > 0) {
    self.offlineQueue.forEach(function (query, index) {
      if (query.ts < now - self.queueTTL) {
        lastDocumentIndex = index;
      }
    });

    if (lastDocumentIndex !== -1) {
      self.offlineQueue.splice(0, lastDocumentIndex + 1);
    }
  }

  if (self.queueMaxSize > 0 && self.offlineQueue.length > self.queueMaxSize) {
    self.offlineQueue.splice(0, self.offlineQueue.length - self.queueMaxSize);
  }
}

/**
 * Emit a request to Kuzzle
 *
 * @param {object} request
 * @param {responseCallback} [cb]
 */
function emitRequest (request, cb) {
  var
    now = Date.now(),
    self = this;

  if (self.jwtToken !== undefined || cb) {
    self.socket.once(request.requestId, function (response) {
      if (response.error && response.error.message === 'Token expired') {
        self.jwtToken = undefined;
        self.emitEvent('jwtTokenExpired', request, cb);
      }

      if (cb) {
        cb(response.error, response);
      }
    });
  }

  self.socket.emit('kuzzle', request);

  // Track requests made to allow KuzzleRoom.subscribeToSelf to work
  self.requestHistory[request.requestId] = now;

  // Clean history from requests made more than 10s ago
  Object.keys(self.requestHistory).forEach(function (key) {
    if (self.requestHistory[key] < now - 10000) {
      delete self.requestHistory[key];
    }
  });
}

/**
 * Play all queued requests, in order.
 */
function dequeue () {
  var self = this;

  if (self.offlineQueue.length > 0) {
    emitRequest.call(self, self.offlineQueue[0].query, self.offlineQueue[0].cb);
    self.offlineQueue.shift();

    setTimeout(function () {
      dequeue.call(self);
    }, Math.max(0, self.replayInterval));
  } else {
    self.queuing = false;
  }
}

/**
 * Renew all registered subscriptions. Triggered either by a successful connection/reconnection or by a
 * successful login attempt
 */
function renewAllSubscriptions() {
  var self = this;

  Object.keys(self.subscriptions).forEach(function (roomId) {
    Object.keys(self.subscriptions[roomId]).forEach(function (subscriptionId) {
      var subscription = self.subscriptions[roomId][subscriptionId];
      subscription.renew(subscription.callback);
    });
  });
}

/**
 * Adds a listener to a Kuzzle global event. When an event is fired, listeners are called in the order of their
 * insertion.
 *
 * The ID returned by this function is required to remove this listener at a later time.
 *
 * @param {string} event - name of the global event to subscribe to (see the 'eventListeners' object property)
 * @param {function} listener - callback to invoke each time an event is fired
 * @returns {string} Unique listener ID
 */
Kuzzle.prototype.addListener = function(event, listener) {
  var
    knownEvents = Object.keys(this.eventListeners),
    listenerType = typeof listener,
    listenerId;

  this.isValid();

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  if (listenerType !== 'function') {
    throw new Error('Invalid listener type: expected a function, got a ' + listenerType);
  }

  listenerId = uuid.v1();
  this.eventListeners[event].listeners.push({id: listenerId, fn: listener});
  return listenerId;
};


/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method returns all available statistics from Kuzzle.
 *
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getAllStatistics = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getAllStatistics', cb);

  this.query({controller:'admin', action: 'getAllStats'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.hits);
  });

  return this;
};

/**
 * Kuzzle monitors active connections, and ongoing/completed/failed requests.
 * This method allows getting either the last statistics frame, or a set of frames starting from a provided timestamp.
 *
 * @param {number} timestamp -  Epoch time. Starting time from which the frames are to be retrieved
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getStatistics = function (timestamp, options, cb) {
  var queryCB;

  if (!cb) {
    if (arguments.length === 1) {
      cb = arguments[0];
      options = null;
      timestamp = null;
    } else {
      cb = arguments[1];
      if (typeof arguments[0] === 'object') {
        options = arguments[0];
        timestamp = null;
      } else {
        timestamp = arguments[0];
        options = null;
      }
    }
  }

  queryCB = function (err, res) {
    if (err) {
      return cb(err);
    }

    if (timestamp) {
      cb(null, res.result.hits);
    } else {
      cb(null, [res.result]);
    }
  };

  this.callbackRequired('Kuzzle.getStatistics', cb);

  if (!timestamp) {
    this.query({controller: 'admin', action: 'getLastStats'}, {}, options, queryCB);
  } else {
    this.query({controller: 'admin', action: 'getStats'}, { body: { startTime: timestamp } }, options, queryCB);
  }

  return this;
};

/**
 * Create a new instance of a KuzzleDataCollection object.
 * If no index is specified, takes the default index.
 *
 * @param {string} [index] - The name of the data index containing the data collection
 * @param {string} collection - The name of the data collection you want to manipulate
 * @returns {object} A KuzzleDataCollection instance
 */
Kuzzle.prototype.dataCollectionFactory = function(index, collection) {
  this.isValid();

  if (arguments.length === 1) {
    collection = arguments[0];
    index = this.defaultIndex;
  }
  else if (arguments.length === 2 && typeof collection === 'object') {
    headers = collection;
    collection = index;
    index = this.defaultIndex;
  }

  if (!index) {
    throw new Error('Unable to create a new data collection object: no index specified');
  }

  if (!this.collections[index]) {
    this.collections[index] = {};
  }

  if (!this.collections[index][collection]) {
    this.collections[index][collection] = new KuzzleDataCollection(this, index, collection);
  }

  return this.collections[index][collection];
};

/**
 * Empties the offline queue without replaying it.
 *
 * @returns {Kuzzle}
 */
Kuzzle.prototype.flushQueue = function () {
  this.offlineQueue = [];
  return this;
};

/**
 * Returns the list of known persisted data collections.
 *
 * @param {string} [index] - Index containing collections to be listed
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.listCollections = function () {
  var
    collectionType = 'all',
    index,
    options,
    cb,
    args = Array.prototype.slice.call(arguments);

  args.forEach(function(arg) {
    switch (typeof arg) {
      case 'string':
        index = arg;
        break;
      case 'object':
        options = arg;
        break;
      case 'function':
        cb = arg;
        break;
    }
  });

  if (!index) {
    if (!this.defaultIndex) {
      throw new Error('Kuzzle.listCollections: index required');
    }

    index = this.defaultIndex;
  }

  this.callbackRequired('Kuzzle.listCollections', cb);

  if (options && options.type) {
    collectionType = options.type;
  }

  this.query({index: index, controller: 'read', action: 'listCollections'}, {body: {type: collectionType}}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    return cb(null, res.result.collections);
  });

  return this;
};

/**
 * Returns the list of existing indexes in Kuzzle
 *
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.listIndexes = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.listIndexes', cb);

  this.query({controller: 'read', action: 'listIndexes'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    return cb(null, res.result.indexes);
  });

  return this;
};

/**
 * Disconnects from Kuzzle and invalidate this instance.
 */
Kuzzle.prototype.disconnect = function () {
  var collection;

  this.logout();

  this.state = 'disconnected';
  this.socket.close();
  this.socket = null;

  for (collection in this.collections) {
    if (this.collections.hasOwnProperty(collection)) {
      delete this.collections[collection];
    }
  }
};

/**
 * Returns the server informations
 *
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.getServerInfo = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.getServerInfo', cb);

  this.query({controller: 'read', action: 'serverInfo'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.serverInfo);
  });

  return this;
};

/**
 * Return the current Kuzzle's UTC Epoch time, in milliseconds
 * @param {object} [options] - Optional parameters
 * @param {responseCallback} cb - Handles the query response
 * @returns {object} this
 */
Kuzzle.prototype.now = function (options, cb) {
  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  this.callbackRequired('Kuzzle.now', cb);

  this.query({controller: 'read', action: 'now'}, {}, options, function (err, res) {
    if (err) {
      return cb(err);
    }

    cb(null, res.result.now);
  });

  return this;
};

/**
 * This is a low-level method, exposed to allow advanced SDK users to bypass high-level methods.
 * Base method used to send read queries to Kuzzle
 *
 * Takes an optional argument object with the following properties:
 *    - metadata (object, default: null):
 *        Additional information passed to notifications to other users
 *
 * @param {object} queryArgs - Query configuration
 * @param {object} query - The query data
 * @param {object} [options] - Optional arguments
 * @param {responseCallback} [cb] - Handles the query response
 */
Kuzzle.prototype.query = function (queryArgs, query, options, cb) {
  var
    attr,
    object = {
      action: queryArgs.action,
      controller: queryArgs.controller,
      metadata: this.metadata
    },
    self = this;

  this.isValid();

  if (!cb && typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options) {
    if (options.metadata) {
      Object.keys(options.metadata).forEach(function (meta) {
        object.metadata[meta] = options.metadata[meta];
      });
    }

    if (options.queuable === false && self.state === 'offline') {
      return self;
    }
  }

  if (query.metadata) {
    Object.keys(query.metadata).forEach(function (meta) {
      object.metadata[meta] = query.metadata[meta];
    });
  }

  for (attr in query) {
    if (attr !== 'metadata' && query.hasOwnProperty(attr)) {
      object[attr] = query[attr];
    }
  }

  object = self.addHeaders(object, this.headers);

  /*
   * Do not add the token for the checkToken route, to avoid getting a token error when
   * a developer simply wish to verify his token
   */
  if (self.jwtToken !== undefined && !(object.controller === 'auth' && object.action === 'checkToken')) {
    object.headers = object.headers || {};
    object.headers.authorization = 'Bearer ' + self.jwtToken;
  }

  if (queryArgs.collection) {
    object.collection = queryArgs.collection;
  }

  if (queryArgs.index) {
    object.index = queryArgs.index;
  }

  if (!object.requestId) {
    object.requestId = uuid.v4();
  }

  if (self.state === 'connected' || (options && options.queuable === false)) {
    if (self.state === 'connected') {
      emitRequest.call(this, object, cb);
    } else if (cb) {
      cb(new Error('Unable to execute request: not connected to a Kuzzle server.\nDiscarded request: ' + object));
    }
  } else if (self.queuing|| ['initializing', 'connecting'].indexOf(self.state) !== -1) {
    cleanQueue.call(this, object, cb);

    if (self.queueFilter) {
      if (self.queueFilter(object)) {
        self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
      }
    } else {
      self.offlineQueue.push({ts: Date.now(), query: object, cb: cb});
    }
  }

  return self;
};

/**
 * Removes all listeners, either from a specific event or from all events
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 */
Kuzzle.prototype.removeAllListeners = function (event) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  if (event) {
    if (knownEvents.indexOf(event) === -1) {
      throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
    }

    this.eventListeners[event].listeners = [];
  } else {
    knownEvents.forEach(function (eventName) {
      self.eventListeners[eventName].listeners = [];
    });
  }
};

/**
 * Removes a listener from an event.
 *
 * @param {string} event - One of the event described in the Event Handling section of this documentation
 * @param {string} listenerId - The ID returned by addListener
 */
Kuzzle.prototype.removeListener = function (event, listenerId) {
  var
    knownEvents = Object.keys(this.eventListeners),
    self = this;

  if (knownEvents.indexOf(event) === -1) {
    throw new Error('[' + event + '] is not a known event. Known events: ' + knownEvents.toString());
  }

  this.eventListeners[event].listeners.forEach(function (listener, index) {
    if (listener.id === listenerId) {
      self.eventListeners[event].listeners.splice(index, 1);
    }
  });
};

/**
 * Replays the requests queued during offline mode.
 * Works only if the SDK is not in a disconnected state, and if the autoReplay option is set to false.
 */
Kuzzle.prototype.replayQueue = function () {
  if (this.state !== 'offline' && !this.autoReplay) {
    cleanQueue.call(this);
    dequeue.call(this);
  }

  return this;
};

/**
 * Sets the default Kuzzle index
 *
 * @param index
 * @returns this
 */
Kuzzle.prototype.setDefaultIndex = function (index) {
  if (typeof index !== 'string') {
    throw new Error('Invalid default index: [' + index + '] (an index name is expected)');
  }

  if (index.length === 0) {
    throw new Error('Cannot set an empty index as the default index');
  }

  this.defaultIndex = index;

  return this;
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
Kuzzle.prototype.setHeaders = function (content, replace) {
  var self = this;

  if (typeof content !== 'object' || Array.isArray(content)) {
    throw new Error('Expected a content object, received a ' + typeof content);
  }

  if (replace) {
    self.headers = content;
  } else {
    Object.keys(content).forEach(function (key) {
      self.headers[key] = content[key];
    });
  }

  return self;
};

/**
 * Starts the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
Kuzzle.prototype.startQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = true;
  }
  return this;
};

/**
 * Stops the requests queuing. Works only during offline mode, and if the autoQueue option is set to false.
 */
Kuzzle.prototype.stopQueuing = function () {
  if (this.state === 'offline' && !this.autoQueue) {
    this.queuing = false;
  }

  return this;
};
