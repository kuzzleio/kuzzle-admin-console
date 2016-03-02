var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  proxyquire = require('proxyquire'),
  EventEmitter = require('events').EventEmitter,
  kuzzleSource = '../../src/kuzzle';

describe('Kuzzle constructor', () => {
  var Kuzzle;

  describe('#constructor', function () {
    before(function () {
      Kuzzle = proxyquire(kuzzleSource, {
        'socket.io-client' : function () {
          var emitter = new EventEmitter;
          process.nextTick(() => emitter.emit('connect'));
          return emitter;
        }
      });
    });

    it('when in javascript mode, it should not load socket.io', function () {
      var
        KuzzleRewired = rewire(kuzzleSource),
        fakeIO = false,
        kuzzle;

      KuzzleRewired.__with__({
        'window': {io:function () { fakeIO = true; return new EventEmitter; }}
      })(function () {
        kuzzle = new KuzzleRewired('foo');
        should(fakeIO).be.true();
      });
    });

    it('should expose the documented functions', () => {
      var kuzzle;

      kuzzle = new Kuzzle('nowhere');

      should.exist(kuzzle.addListener);
      should.exist(kuzzle.dataCollectionFactory);
      should.exist(kuzzle.flushQueue);
      should.exist(kuzzle.getAllStatistics);
      should.exist(kuzzle.getJwtToken);
      should.exist(kuzzle.getStatistics);
      should.exist(kuzzle.listCollections);
      should.exist(kuzzle.disconnect);
      should.exist(kuzzle.login);
      should.exist(kuzzle.logout);
      should.exist(kuzzle.now);
      should.exist(kuzzle.query);
      should.exist(kuzzle.removeAllListeners);
      should.exist(kuzzle.removeListener);
      should.exist(kuzzle.replayQueue);
      should.exist(kuzzle.setHeaders);
      should.exist(kuzzle.startQueuing);
      should.exist(kuzzle.stopQueuing);
      should.exist(kuzzle.setJwtToken);
    });

    it('should expose the documented properties', () => {
      var kuzzle = new Kuzzle('nowhere');

      should(kuzzle).have.propertyWithDescriptor('autoQueue', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoReconnect', { enumerable: true, writable: false, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoReplay', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoResubscribe', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('defaultIndex', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('offlineQueue', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueFilter', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueMaxSize', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueTTL', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('metadata', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('replayInterval', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('reconnectionDelay', { enumerable: true, writable: false, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('jwtToken', { enumerable: true, writable: true, configurable: false });
    });

    it('should have properties with the documented default values', () => {
      var kuzzle = new Kuzzle('nowhere');

      should(kuzzle.autoQueue).be.false();
      should(kuzzle.autoReconnect).be.true();
      should(kuzzle.autoReplay).be.false();
      should(kuzzle.autoResubscribe).be.true();
      should(kuzzle.queueTTL).be.exactly(120000);
      should(kuzzle.queueMaxSize).be.exactly(500);
      should(kuzzle.headers).be.an.Object().and.be.empty();
      should(kuzzle.metadata).be.an.Object().and.be.empty();
      should(kuzzle.replayInterval).be.exactly(10);
      should(kuzzle.reconnectionDelay).be.exactly(1000);
      should(kuzzle.defaultIndex).be.undefined();
    });

    it('should initialize correctly properties using the "options" argument', () => {
      var
        options = {
          autoQueue: true,
          autoReconnect: false,
          autoReplay: true,
          autoResubscribe: false,
          queueTTL: 123,
          queueMaxSize: 42,
          headers: {foo: 'bar'},
          metadata: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
          replayInterval: 99999,
          reconnectionDelay: 666,
          defaultIndex: 'foobar'
        },
        kuzzle = new Kuzzle('nowhere', options);

      should(kuzzle.autoQueue).be.exactly(options.autoQueue);
      should(kuzzle.autoReconnect).be.exactly(options.autoReconnect);
      should(kuzzle.autoReplay).be.exactly(options.autoReplay);
      should(kuzzle.autoResubscribe).be.exactly(options.autoResubscribe);
      should(kuzzle.defaultIndex).be.exactly('foobar');
      should(kuzzle.queueTTL).be.exactly(options.queueTTL);
      should(kuzzle.queueMaxSize).be.exactly(options.queueMaxSize);
      should(kuzzle.headers).be.an.Object().and.match(options.headers);
      should(kuzzle.metadata).be.an.Object().and.match(options.metadata);
      should(kuzzle.replayInterval).be.exactly(options.replayInterval);
      should(kuzzle.reconnectionDelay).be.exactly(options.reconnectionDelay);
    });

    it('should handle the offlineMode option properly', () => {
      var kuzzle = new Kuzzle('nowhere', {offlineMode: 'auto'});

      should(kuzzle.autoQueue).be.true();
      should(kuzzle.autoReconnect).be.true();
      should(kuzzle.autoReplay).be.true();
      should(kuzzle.autoResubscribe).be.true();
    });

    it('should handle the connect option properly', () => {
      var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

      should(kuzzle.state).be.exactly('ready');
      should(kuzzle.socket).be.null();

      kuzzle = new Kuzzle('nowhere', {connect: 'auto'});
      should(kuzzle.state).be.exactly('connecting');
      should(kuzzle.socket).not.be.null();
    });

    it('should return a new instance even if not called with "new"', () => {
      var kuzzle = Kuzzle('nowhere');

      kuzzle.should.be.instanceof(Kuzzle);
    });

    it('should allow passing a callback and respond once initialized', function (done) {
      this.timeout(500);

      new Kuzzle('nowhere', () => {
        try {
          kuzzle.isValid();
          done('Error: the kuzzle object should have been invalidated');
        }
        catch(e) {
          done();
        }
      });
    });

    it('should promisify the right functions', () => {
      var kuzzle;

      Kuzzle.prototype.bluebird = bluebird;
      kuzzle = new Kuzzle('nowhere');

      should.not.exist(kuzzle.addListenerPromise);
      should.not.exist(kuzzle.connectPromise);
      should.not.exist(kuzzle.dataCollectionFactoryPromise);
      should.not.exist(kuzzle.flushQueuePromise);
      should.exist(kuzzle.getAllStatisticsPromise);
      should.not.exist(kuzzle.getJwtTokenPromise);
      should.exist(kuzzle.getServerInfoPromise);
      should.exist(kuzzle.getStatisticsPromise);
      should.exist(kuzzle.listCollectionsPromise);
      should.exist(kuzzle.listIndexesPromise);
      should.exist(kuzzle.loginPromise);
      should.exist(kuzzle.logoutPromise);
      should.exist(kuzzle.nowPromise);
      should.exist(kuzzle.queryPromise);
      should.exist(kuzzle.checkTokenPromise);
      should.exist(kuzzle.whoAmIPromise);
      should.not.exist(kuzzle.removeAllListenersPromise);
      should.not.exist(kuzzle.removeListenerPromise);
      should.not.exist(kuzzle.replayQueuePromise);
      should.not.exist(kuzzle.setJwtTokenPromise);
      should.not.exist(kuzzle.setHeadersPromise);
      should.not.exist(kuzzle.startQueuingPromise);
      should.not.exist(kuzzle.stopQueuingPromise);
    });

    it('should throw an error if no URL is provided', () => {
      try {
        new Kuzzle();
        should.fail('success', 'failure', 'Constructor should fail with no URL provided', '');
      }
      catch (e) {

      }
    });

    it('should throw an error if no index is provied', () => {
      try {
        new Kuzzle('foo');
        should.fail('success', 'failure', 'Constructor should fail with no Index provided', '');
      }
      catch (e) {

      }
    });

    describe('#connect', function () {
      var iostub = function () {
        var emitter = new EventEmitter;
        process.nextTick(() => emitter.emit('connect'));
        return emitter;
      };

      beforeEach(function () {
        Kuzzle = proxyquire(kuzzleSource, {'socket.io-client' : iostub});
      });

      it('should return immediately if already connected', function (done) {
        var kuzzle;

        this.timeout(200);

        Kuzzle = proxyquire(kuzzleSource, {
          io: function () {
            // does nothing, making the test crash if trying to connect
          }
        });

        kuzzle = new Kuzzle('nowhere', {connect: 'manual'}, (err, res) => {
          should(err).be.null();
          should(res).be.exactly(kuzzle);
          should(res.state).be.exactly('connected');
          done();
        });

        kuzzle.state = 'connected';
        kuzzle.connect();
      });

      it('should return immediately if trying to reconnect', function (done) {
        var kuzzle;

        this.timeout(200);

        Kuzzle = proxyquire(kuzzleSource, {
          io: function () {
            // does nothing, making the test crash if trying to connect
          }
        });

        kuzzle = new Kuzzle('nowhere', {connect: 'manual'}, (err, res) => {
          should(err).be.null();
          should(res).be.exactly(kuzzle);
          should(res.state).be.exactly('reconnecting');
          done();
        });

        kuzzle.state = 'reconnecting';
        kuzzle.connect();
      });

      it('should try to connect when the instance is in a not-connected state', function () {
        ['initializing', 'ready', 'disconnected', 'error', 'offline'].forEach(state => {
          var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

          kuzzle.state = state;
          should(kuzzle.connect()).be.exactly(kuzzle);
          should(kuzzle.state).be.exactly('connecting');
          kuzzle.socket.removeAllListeners();
        });
      });

      it('should registered listeners upon receiving a connect event', function (done) {
        var
          kuzzle = new Kuzzle('nowhere', {connect: 'manual'}),
          listenerCalled = false;

        kuzzle.state = 'initializing';
        kuzzle.addListener('connected', function () { listenerCalled = true; });
        kuzzle.connect();

        setTimeout(() => {
          should(listenerCalled).be.true();
          kuzzle.socket.removeAllListeners();
          done();
        }, 10);
      });

      describe('=> on connection error', () => {
        beforeEach(function () {
          Kuzzle = proxyquire(kuzzleSource, {
            'socket.io-client': function () {
              var emitter = new EventEmitter;
              process.nextTick(() => emitter.emit('connect_error', 'error'));
              return emitter;
            }
          });
        });

        it('should call the provided callback on a connection error', function (done) {
          var kuzzle;

          this.timeout(50);

          kuzzle = new Kuzzle('nowhere', function (err, res) {
            try {
              should(err).be.exactly('error');
              should(res).be.undefined();
              should(kuzzle.state).be.exactly('error');
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          });
        });

        it('should registered listeners upon receiving a error event', function (done) {
          var kuzzle = new Kuzzle('nowhere');

          kuzzle.addListener('error', function () { listenerCalled = true; });

          setTimeout(() => {
            try {
              should(listenerCalled).be.true();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });
      });

      describe('=> on connection success', () => {
        it('should call the provided callback on a connection success', function (done) {
          var kuzzle;
          this.timeout(50);

          kuzzle = new Kuzzle('nowhere', function (err, res) {
            try {
              should(err).be.null();
              should(res).be.instanceof(Kuzzle);
              should(res.state).be.exactly('connected');
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          });
        });

        it('should renew subscriptions automatically on a connection success', function (done) {
          var
            kuzzle,
            renewed = false;

          this.timeout(50);

          kuzzle = new Kuzzle('nowhere', {connect: 'manual', autoResubscribe: false});
          kuzzle.subscriptions['foo'] = {
            bar: {
              renew: function () { renewed = true; }
            }
          };

          kuzzle.connect();
          should(kuzzle.state).be.exactly('connecting');

          setTimeout(() => {
            should(renewed).be.true();
            kuzzle.socket.removeAllListeners();
            done();
          }, 20);
        });

        it('should dequeue requests automatically on a connection success', function (done) {
          var
            dequeued = false,
            kuzzle,
            KuzzleRewired = rewire(kuzzleSource),
            revert = KuzzleRewired.__set__('dequeue', function () { dequeued = true; });

          this.timeout(500);

          kuzzle = new KuzzleRewired('nowhere', {connect: 'manual', autoReplay: false, autoQueue: false}, () => {
            should(kuzzle.state).be.exactly('connected');
            should(dequeued).be.true();
            kuzzle.socket.removeAllListeners();
            revert();
            done();
          });

          kuzzle.io = iostub;

          kuzzle.connect();
        });
      });

      describe('=> on disconnection', () => {
        beforeEach(function () {
          Kuzzle = proxyquire(kuzzleSource, {
            'socket.io-client': function () {
              var emitter = new EventEmitter;

              /*
               since we're stubbing the socket.io socket object,
               we need a stubbed 'close' function to make kuzzle.logout() work
               */
              emitter.close = function () {
                return false;
              };
              process.nextTick(() => emitter.emit('disconnect'));
              return emitter;
            }
          });
        });

        it('should enter offline mode and call listeners', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            listenerCalled = false;

          this.timeout(200);

          kuzzle.addListener('disconnected', function () { listenerCalled = true; });

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('offline');
              should(kuzzle.queuing).be.false();
              should(listenerCalled).be.true();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should enable queuing if autoQueue is set to true', function (done) {
          var kuzzle = new Kuzzle('nowhere', {autoQueue: true});
          this.timeout(200);

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('offline');
              should(kuzzle.queuing).be.true();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should invalidated the instance if autoReconnect is set to false', function (done) {
          var kuzzle = new Kuzzle('nowhere', {autoReconnect: false});

          this.timeout(200);

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('offline');
              should(kuzzle.queuing).be.false();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done('the kuzzle instance should have been invalidated');
            }
            catch (e) {
              done();
            }
          }, 10);
        });
      });

      describe('=> on reconnection', () => {
        var
          iostub = function () {
            var emitter = new EventEmitter;
            process.nextTick(() => emitter.emit('reconnect'));
            return emitter;
          };

        beforeEach(function () {
          Kuzzle = proxyquire(kuzzleSource, {
            'socket.io-client': iostub
          });
        });

        it('should exit offline mode when reconnecting', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            listenersCalled = false;

          this.timeout(200);

          kuzzle.addListener('reconnected', function () { listenersCalled = true; });
          kuzzle.queuing = true;

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(listenersCalled).be.true();
              // should not switch queuing to 'false' automatically by default
              should(kuzzle.queuing).be.true();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should renew subscriptions automatically when exiting offline mode', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            renewCalled = false,
            stubKuzzleRoom = {
              callback: function () { renewCalled = true; },
              renew: function (cb) { cb(); }
            };

          this.timeout(200);

          kuzzle.subscriptions['foo'] = { bar: stubKuzzleRoom };

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(renewCalled).be.true();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should not renew subscriptions if autoResubscribe is set to false', function (done) {
          var
            kuzzle = new Kuzzle('nowhere', {autoResubscribe: false}),
            renewCalled = false,
            stubKuzzleRoom = {
              callback: function () { renewCalled = true; },
              renew: function (cb) { cb(); }
            };

          this.timeout(200);

          kuzzle.subscriptions['foo'] = {
            bar: stubKuzzleRoom
          };

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(renewCalled).be.false();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should replay pending requests automatically if autoReplay is set to true', function (done) {
          var
            kuzzle = new Kuzzle('nowhere', {autoReplay: true});

          this.timeout(200);

          kuzzle.queuing = true;

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(kuzzle.queuing).be.false();
              kuzzle.isValid();
              kuzzle.socket.removeAllListeners();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should empty the JWT Token if it has expired', function (done) {
          var
            kuzzle = new Kuzzle('nowhere', {}),
            eventEmitted = false;

          this.timeout(200);
          kuzzle.jwtToken = 'foobar';
          kuzzle.addListener('jwtTokenExpired', function () { eventEmitted = true });

          kuzzle.checkToken = function (token, cb) {
            should(token).be.eql(kuzzle.jwtToken);
            cb(null, {valid: false});
          };

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(kuzzle.jwtToken).be.undefined();
              should(eventEmitted).be.true();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });
      });
    });

    describe("#login", () => {
      var
        loginCalled = false,
        loginStub = function(strategy, credentials, expiresIn, cb) {
          loginCalled = true;

          if (typeof cb === 'function') {
            if (strategy === 'error') {
              cb(new Error());
            }
            else {
              cb(null);
            }
          }
        },
        iostub = function () {
          var emitter = new EventEmitter;
          process.nextTick(() => emitter.emit('connect'));
          return emitter;
        };

      beforeEach(function () {
        Kuzzle = proxyquire(kuzzleSource, {'socket.io-client' : iostub});
      });

      it('should call the provided callback on a connection & login success', function (done) {
        var kuzzle;
        this.timeout(150);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual',
          loginStrategy: 'local',
          loginCredentials: {
            username: 'foo',
            password: 'bar'
          }
        }, function (err, res) {
          try {
            should(err).be.null();
            should(res).be.instanceof(Kuzzle);
            should(res.state).be.exactly('connected');
            kuzzle.socket.removeAllListeners();
            done();
          }
          catch (e) {
            done(e);
          }
        });

        kuzzle.login = loginStub;
        kuzzle.connect();
      });


      it('should emit a connected event when connection & login success', function (done) {
        var
          kuzzle,
          listenerConnected = false;

        this.timeout(150);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual',
          loginStrategy: 'local',
          loginCredentials: {
            username: 'foo',
            password: 'bar'
          }
        }, function (err, res) {
          try {
            should(err).be.null();
            should(res).be.instanceof(Kuzzle);
            should(res.state).be.exactly('connected');
            should(listenerConnected).be.exactly(true);
            kuzzle.socket.removeAllListeners();
            done();
          }
          catch (e) {
            done(e);
          }
        });

        kuzzle.login = loginStub;
        kuzzle.addListener('connected', function() {
          listenerConnected = true;
        });
        kuzzle.connect();
      });

      it('should have the token in login callback', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, { result: {jwt: 'test-toto'}});
        };

        kuzzle.login('local', loginCredentials, '1h', function(error, k) {
          should(k.jwtToken).be.exactly('test-toto');
          done();
        });
      });

      it('should handle optional arguments correctly', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          should(query.expiresIn).be.undefined();
          done();
        };

        kuzzle.login('local', loginCredentials, function () {});
      });

      it('should handle optional callback correctly', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          should(query.expiresIn).be.undefined();
          done();
        };

        kuzzle.login('local', loginCredentials);
      });

      it('should have a empty token in logout callback', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(null, {});
        };

        kuzzle.logout(function(error, k) {
          should(k.jwtToken).be.exactly(undefined);
          done();
        });
      });

      it('should give an error if login query fail to the logout callback if is set', function (done) {
        var
          kuzzle;

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(new Error());
        };

        kuzzle.logout(function(error, k) {
          should(error).be.an.instanceOf(Error);
          done();
        });
      });

      it('should raise an error if login query fail and no callback is set', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(new Error());
        };

        try {
          kuzzle.login('local', loginCredentials, '1h');
        }
        catch(err) {
          should(err).be.an.instanceOf(Error);
          done();
        }
      });

      it('should give an error if login query fail to the login callback if is set', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options, cb) {
          cb(new Error());
        };

        try {
          kuzzle.login('local', loginCredentials, '1h', function(error, k) {
            should(error).be.an.instanceOf(Error);
            done();
          });
        }
        catch(err) {
          done(err);
        }
      });

      it('should be able to send a login request', function (done) {
        var
          kuzzle,
          loginCredentials = {username: 'foo', password: 'bar'};

        this.timeout(200);

        kuzzle = new Kuzzle('nowhere', {
          connect: 'manual'
        });

        kuzzle.query = function(queryArgs, query, options) {
          should(queryArgs.action).be.exactly('login');
          should(queryArgs.controller).be.exactly('auth');
          should(query.body.username).be.exactly('foo');
          should(query.body.password).be.exactly('bar');
          should(query.body.expiresIn).be.exactly('1h');
          should(options.queuable).be.false();
          done();
        };

        kuzzle.login('local', loginCredentials, '1h');
      });

      it('should forward token when logged in', function () {
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

        kuzzle.query({collection: 'collection', controller: 'controller', action: 'action', index: 'index'}, {});

        should(kuzzle.offlineQueue.length).be.exactly(1);
        should(kuzzle.offlineQueue[0].ts).not.be.undefined().and.be.approximately(now, 100);
        should(kuzzle.offlineQueue[0].query.action).be.exactly('action');
        should(kuzzle.offlineQueue[0].query.controller).be.exactly('controller');
        should(kuzzle.offlineQueue[0].query.index).be.exactly('index');
        should(kuzzle.offlineQueue[0].query.headers.authorization).be.exactly('Bearer fake-token');
      });
    });
  });
});
