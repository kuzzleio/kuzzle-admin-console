var
  should = require('should'),
  rewire = require('rewire'),
  proxyquire = require('proxyquire'),
  EventEmitter = require('events').EventEmitter,
  kuzzleSource = '../../src/kuzzle';


describe('Query management', function () {
  describe('#emitRequest', function () {
    var
      emitRequest = rewire(kuzzleSource).__get__('emitRequest'),
      Kuzzle,
      kuzzle;

    before(function () {
      Kuzzle = proxyquire(kuzzleSource, {
        'socket.io-client': function () { return new EventEmitter; }
      });
    });

    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should emit the request when asked to', function (done) {
      var start = Date.now();

      this.timeout(50);

      kuzzle.socket.on('kuzzle', function () {
        // the event is emitted before the historization, so we need to delay our check a bit
        process.nextTick(() => {
          var end = Date.now();

          try {
            should(kuzzle.requestHistory['bar']).be.within(start, end);
            done();
          }
          catch (e) {
            done(e);
          }
        })
      });

      emitRequest.call(kuzzle, {requestId: 'bar'});
    });

    it('should emit the request when asked to', function (done) {
      var listenerJwtTokenExpired = false;

      Kuzzle = proxyquire(kuzzleSource, {
        'socket.io-client': function () {
          var emitter = new EventEmitter;
          process.nextTick(() => emitter.emit('bar', {
            error: {
              message: 'Token expired'
            }
          }));
          return emitter;
        }
      });

      kuzzle = new Kuzzle('foo');

      kuzzle.addListener('jwtTokenExpired', function() {
        listenerJwtTokenExpired = true;
      });

      this.timeout(150);

      emitRequest.call(kuzzle, {requestId: 'bar'}, function(error, result) {
        should(listenerJwtTokenExpired).be.exactly(true);
        should(error.message).be.exactly('Token expired');
        done();
      });
    });

    it('should launch the callback once a response has been received', function (done) {
      var response = {result: 'foo', error: 'bar'},
        cb = function (err, res) {
          should(err).be.exactly(response.error);
          should(res).be.exactly(response);
          done();
        };

      this.timeout(50);

      kuzzle.socket.on('kuzzle', request => {
        kuzzle.socket.emit(request.requestId, response);
      });

      emitRequest.call(kuzzle, {requestId: 'someEvent'}, cb);
    });

    it('should delete older history entries when necessary', function () {
      var now = Date.now();

      kuzzle.requestHistory['foo'] = now - 30000;
      kuzzle.requestHistory['bar'] = now - 20000;
      kuzzle.requestHistory['baz'] = now - 11000;
      kuzzle.requestHistory['qux'] = now - 1000;

      emitRequest.call(kuzzle, {requestId: 'xyz'});

      should(Object.keys(kuzzle.requestHistory).length).be.exactly(2);
      should(Object.keys(kuzzle.requestHistory)).match(['qux', 'xyz']);
    });
  });

  describe('#query', function () {
    var
      requestObject,
      emitted,
      callback,
      queryArgs = {
        controller: 'controller',
        action: 'action',
        collection: 'collection',
        index: 'index'
      },
      kuzzle;

    before(function () {
      Kuzzle = rewire(kuzzleSource);
      Kuzzle.__set__('emitRequest', function (object, cb) {
        emitted = true;
        requestObject = object;
        callback = cb;
      });
    });

    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.state = 'connected';
      requestObject = {};
      callback = null;
      emitted = false;
    });

    it('should generate a valid request object', function () {
      kuzzle.query(queryArgs, { body: { some: 'query'}});
      should(requestObject.index).be.exactly('index');
      should(requestObject.controller).be.exactly('controller');
      should(requestObject.collection).be.exactly('collection');
      should(requestObject.action).be.exactly('action');
      should(requestObject.body).match({some: 'query'});
      should(requestObject.requestId).not.be.undefined().and.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should manage arguments properly if no options are provided', function () {
      var cb = function () {};

      kuzzle.query(queryArgs, { body: { some: 'query'}}, cb);

      should(callback).be.exactly(cb);
    });

    it('should handle options metadata properly', function () {
      var
        metadata = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, { body: { some: 'query'}}, {metadata: metadata});
      should(requestObject.metadata).match(metadata);
    });

    it('should exit early if the query is not queuable and the SDK is offline', function () {
      kuzzle.state = 'offline';
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false});
      should(emitted).be.false();
    });

    it('should copy query local metadata over optional ones', function () {
      var
        metadata = {
          foo: 'bar',
          baz: ['foo', 'bar', 'qux']
        };

      kuzzle.query(queryArgs, { body: { some: 'query'}, metadata: {foo: 'foo'}}, {metadata: metadata});
      should(requestObject.metadata.foo).be.exactly('foo');
      should(requestObject.metadata.baz).match(metadata.baz);
    });

    it('should not define optional members if none was provided', function () {
      kuzzle.query({controller: 'foo', action: 'bar'}, { body: { some: 'query'}});
      should(requestObject.collection).be.undefined();
      should(requestObject.index).be.undefined();
    });

    it('should add global headers without overwriting any existing query headers', function () {
      kuzzle.headers = { foo: 'bar', bar: 'foo' };
      kuzzle.query(queryArgs, { foo: 'foo', body: {some: 'query'}});
      should(requestObject.foo).be.exactly('foo');
      should(requestObject.bar).be.exactly('foo');
    });

    it('should not generate a new request ID if one is already defined', function () {
      kuzzle.query(queryArgs, { body: { some: 'query'}, requestId: 'foobar'});
      should(requestObject.requestId).be.exactly('foobar');
    });

    it('should emit the request directly without waiting the end of dequeuing if queuable is false', function () {
      kuzzle.state = 'connected';
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false});
      should(emitted).be.true();

      emitted = false;
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false});
      should(emitted).be.true();
    });

    it('should discard the request if not connected and if queuable is false', function () {
      var
        errorRaised = false,
        callback = () => errorRaised = true;

      kuzzle.state = 'reconnecting';
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false}, callback);
      should(emitted).be.false();
      should(errorRaised).be.true();

      errorRaised = false;
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, { body: { some: 'query'}}, {queuable: false}, callback);
      should(emitted).be.false();
      should(errorRaised).be.true();
    });

    it('should queue the request during offline mode, if queuing has been activated', function () {
      var
        query = { body: { some: 'query'}},
        cb = function () {},
        now = Date.now();

      kuzzle.state = 'offline';
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, query, cb);

      should(emitted).be.false();
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(kuzzle.offlineQueue[0].query).match(query);
      should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
    });

    it('should queue the request if a queue filter has been defined and if it allows queuing', function () {
      var
        query = { body: { some: 'query'}},
        cb = function () {},
        now = Date.now();

      kuzzle.state = 'offline';
      kuzzle.queueFilter = function () { return true; };
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, query, cb);

      should(emitted).be.false();
      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 10);
      should(kuzzle.offlineQueue[0].query).match(query);
      should(kuzzle.offlineQueue[0].cb).be.exactly(cb);
    });

    it('should discard the request if a queue filter has been defined and if it does not allows queuing', function () {
      var
        query = { body: { some: 'query'}},
        cb = function () {};

      kuzzle.state = 'offline';
      kuzzle.queueFilter = function () { return false; };
      kuzzle.queuing = true;
      kuzzle.query(queryArgs, query, cb);

      should(emitted).be.false();
      should(kuzzle.offlineQueue.length).be.exactly(0);
    });

    it('should discard the request if in offline mode but queuing has not yet been activated', function () {
      var
        query = { body: { some: 'query'}},
        cb = function () {};

      kuzzle.state = 'offline';
      kuzzle.queuing = false;
      kuzzle.query(queryArgs, query, cb);

      should(emitted).be.false();
      should(kuzzle.offlineQueue.length).be.exactly(0);
    });

    it('should not set jwtToken if we execute auth/checkToken', function () {
      var
        kuzzle,
        query = { body: { some: 'query'}},
        now = Date.now();

      this.timeout(200);

      Kuzzle = rewire(kuzzleSource);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.queuing = true;
      kuzzle.jwtToken = 'fake-token';

      kuzzle.query({collection: 'collection', controller: 'auth', action: 'checkToken', index: 'index'}, {});

      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].query.headers).be.undefined();
    });
  });
});
