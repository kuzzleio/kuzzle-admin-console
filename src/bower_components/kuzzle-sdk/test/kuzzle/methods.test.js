var
  should = require('should'),
  rewire = require('rewire'),
  proxyquire = require('proxyquire'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = require('../../src/kuzzleDataCollection'),
  KuzzleSecurity = require('../../src/security/kuzzleSecurity'),
  KuzzleUser = require('../../src/security/kuzzleUser');

describe('Kuzzle methods', function () {
  var
    expectedQuery,
    passedOptions,
    error,
    result,
    queryStub = function (args, query, options, cb) {
      emitted = true;
      should(args.collection).be.undefined();
      should(args.index).be.eql(expectedQuery.index);
      should(args.controller).be.exactly(expectedQuery.controller);
      should(args.action).be.exactly(expectedQuery.action);
      if (passedOptions) {
        should(options).match(passedOptions);
      }

      if (expectedQuery.body) {
        should(query.body).match(expectedQuery.body);
      } else {
        should(Object.keys(query).length).be.exactly(0);
      }

      cb(error, result);
    },
    emitted,
    kuzzle;

  describe('#getAllStatistics', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {hits: []}};
      expectedQuery = {
        controller: 'admin',
        action: 'getAllStats'
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.getAllStatistics(function () {})).be.exactly(kuzzle);
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getAllStatistics(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.getAllStatistics({some: 'options'}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call the query function with the right arguments', function () {
      kuzzle.getAllStatistics(function () {});
      should(emitted).be.true();

      emitted = false;
      passedOptions = {queuable: true, metadata: {foo: 'bar'}};
      kuzzle.getAllStatistics(passedOptions, function () {});
    });

    it('should execute the callback with an error if an error occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.getAllStatistics(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#getStatistics', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {hits: []}};
      expectedQuery = {
        controller: 'admin',
        action: 'getLastStats'
      };
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.getStatistics(); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456); }).throw(Error);
      should(function () { kuzzle.getStatistics({}); }).throw(Error);
      should(function () { kuzzle.getStatistics(123456, {}); }).throw(Error);
    });

    it('should return the last statistics frame if no timestamp is provided', function () {
      should(kuzzle.getStatistics(function () {})).be.exactly(kuzzle);
      should(emitted).be.true();
    });

    it('should return statistics frames starting from the given timestamp', function () {
      expectedQuery = {
        controller: 'admin',
        action: 'getStats',
        body: { startTime: 123 }
      };

      result = {
        result: {
          hits: [
            {123: {}},
            {456: {}},
            {789: {}}
          ]
        }
      };

      kuzzle.getStatistics(123, function () {});
      should(emitted).be.true();
    });

    it('should execute the provided callback with an error argument if one occurs', function (done) {
      error = 'foobar';
      kuzzle.getStatistics(function (err, res) {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should handle arguments properly', function () {
      /*
      already tested by previous tests:
       getStatistics(callback)
       getStatistics(timestamp, callback)
       */

      // testing: getStatistics(options, callback)
      passedOptions = { foo: 'bar' };
      kuzzle.getStatistics(passedOptions, function () {});
      should(emitted).be.true();

      // testing: getStatistics(timestamp, options callback);
      emitted = false;
      expectedQuery = {
        controller: 'admin',
        action: 'getStats',
        body: { startTime: 123 }
      };
      kuzzle.getStatistics(123, passedOptions, function () {});
      should(emitted).be.true();
    });
  });

  describe('#dataCollectionFactory', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if the kuzzle instance has been invalidated', function () {
      kuzzle.disconnect();
      should(function () { kuzzle.dataCollectionFactory('foo'); }).throw(Error);
    });

    it('should create and store the data collection instance if needed', function () {
      var collection = kuzzle.dataCollectionFactory('foo', 'bar');

      should(kuzzle.collections['foo']['bar']).not.be.undefined().and.be.instanceof(KuzzleDataCollection);
      should(collection).be.instanceof(KuzzleDataCollection);
    });

    it('should simply pull the collection from the collection history if reinvoked', function () {
      kuzzle.collections['foo'] = { bar: 'qux'};
      should(kuzzle.dataCollectionFactory('foo', 'bar')).be.a.String().and.be.exactly('qux');
    });

    it('should use the default index if no index is provided', function () {
      var
        collection,
        defaultIndex = 'bar';

      kuzzle.setDefaultIndex(defaultIndex);
      collection = kuzzle.dataCollectionFactory('foo');
      should(collection).be.instanceof(KuzzleDataCollection);
      should(collection.index).be.eql(defaultIndex);

      collection = kuzzle.dataCollectionFactory('foo', {some: 'headers'});
      should(collection).be.instanceof(KuzzleDataCollection);
      should(collection.index).be.eql(defaultIndex);
    });

    it('should throw an error if no index is provided and no default index has been set', function (done) {
      try {
        kuzzle.dataCollectionFactory('foo');
        done(new Error('Should have thrown an error'));
      }
      catch (e) {
        done();
      }
    });
  });

  describe('#getServerInfo', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {serverInfo: {
        kuzzle:
        { version: '0.9.2',
          api: { version: '1.0', routes: {} },
          nodeVersion: 'v4.2.1',
          memoryUsed: 100020224,
          uptime: '161089.628s',
          plugins:
          { 'kuzzle-plugin-logger': {},
            'kuzzle-plugin-socketio': {},
            'kuzzle-plugin-auth-passport-local': {} },
          system: { memory: {}, cpus: {} } },
        services: {
          writeEngine: {
            type: 'elasticsearch',
            api: '1.7',
            version: '1.5.2',
            lucene: '4.10.4',
            status: 'red',
            nodes: {},
            spaceUsed: '14.5kb'
          }
        }
      }}};
      expectedQuery = {
        controller: 'read',
        action: 'serverInfo'
      };
    });

    it('should behave correctly when invoked', function () {
      should(kuzzle.getServerInfo(function (err, res) {
        should(err).be.null();
        should(res).be.eql(result.result.serverInfo);
      })).be.eql(kuzzle);
    });

    it('should throw an error if no callback is provided', function () {
      should(function () {kuzzle.getServerInfo()}).throw(Error);
      should(emitted).be.false();

      should(function () {kuzzle.getServerInfo({some: 'options'})}).throw(Error);
      should(emitted).be.false();
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.getServerInfo('foo', function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#listCollections', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {collections: {stored: [], realtime: []}}};
      expectedQuery = {
        index: 'foo',
        controller: 'read',
        action: 'listCollections',
        body: {type: 'all'}
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.listCollections('foo', function () {})).be.exactly(kuzzle);
    });

    it('should throw an error if no callback has been provided', function () {
      should(function () { kuzzle.listCollections('foo'); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.listCollections('foo', {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should throw an error if no index has been provided', function () {
      should(function () {kuzzle.listCollections(function () {})}).throw(Error);
      should(emitted).be.false();
      should(function () {kuzzle.listCollections({}, function () {})}).throw(Error);
      should(emitted).be.false();
    });

    it('should call query with the right arguments', function (done) {
      this.timeout(50);
      result = { result: {collections: {stored: ['foo', 'bar', 'baz'], realtime: ['qux'] } } };

      kuzzle.listCollections('foo', function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.match(result.result.collections);
        done();
      });
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.listCollections('foo', function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should handle options correctly', function (done) {
      expectedQuery.body.type = 'foobar';
      kuzzle.listCollections('foo', {type: 'foobar'}, () => done());
    });

    it('should use the default index if none is provided', function () {
      kuzzle.setDefaultIndex('foo');
      should(kuzzle.listCollections(function () {})).be.exactly(kuzzle);
      should(emitted).be.true();

      emitted = false;
      should(kuzzle.listCollections({some: 'options'}, function () {})).be.exactly(kuzzle);
      should(emitted).be.true();
    });
  });

  describe('#listIndexes', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {indexes: ['foo', 'bar']}};
      expectedQuery = {
        controller: 'read',
        action: 'listIndexes'
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.listIndexes(function (err, res) {
        should(err).be.null();
        should(res).be.eql(result.result.indexes);
      })).be.eql(kuzzle);
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { kuzzle.listIndexes(); }).throw(Error);
      should(emitted).be.false();

      should(function () {kuzzle.listIndexes({some: 'options'})}).throw(Error);
      should(emitted).be.false();
    });

    it('should execute the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.listIndexes(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });


  });

  describe('#disconnect', function () {
    it('should clean up and invalidate the instance if called', function () {
      var kuzzle = new Kuzzle('foo');

      kuzzle.collections = { foo: {}, bar: {}, baz: {} };
      kuzzle.disconnect();

      should(kuzzle.socket).be.null();
      should(kuzzle.collections).be.empty();
      should(function () { kuzzle.isValid(); }).throw(Error);
    });
  });

  describe('#now', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
      kuzzle.query = queryStub;
      emitted = false;
      passedOptions = null;
      error = null;
      result = {result: {now: Date.now()}};
      expectedQuery = {
        controller: 'read',
        action: 'now'
      };
    });

    it('should return the kuzzle instance when called', function () {
      should(kuzzle.now(function () {})).be.exactly(kuzzle);
    });

    it('should throw an error if called without a callback', function () {
      should(function () { kuzzle.now(); }).throw(Error);
      should(emitted).be.false();
      should(function () { kuzzle.now({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should call query with the right arguments', function (done) {
      this.timeout(50);

      kuzzle.now(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result.now);
        done();
      });
    });

    it('should execute the callback with an error argument if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      kuzzle.now(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#setDefaultIndex', function () {
    before(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if the provided index is not a string', function () {
      should((function () {kuzzle.setDefaultIndex()})).throw();
      should((function () {kuzzle.setDefaultIndex({})})).throw();
      should((function () {kuzzle.setDefaultIndex([])})).throw();
      should((function () {kuzzle.setDefaultIndex(123)})).throw();
      should((function () {kuzzle.setDefaultIndex(null)})).throw();
      should((function () {kuzzle.setDefaultIndex(undefined)})).throw();
    });

    it('should throw an error if the provided index is an empty string', function () {
      should((function () {kuzzle.setDefaultIndex('')})).throw();
    });

    it('should set the default index in all other cases', function () {
      should(kuzzle.setDefaultIndex('foo')).be.eql(kuzzle);
      should(kuzzle.defaultIndex).be.eql('foo');
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo');
    });

    it('should throw an error if an invalid content object is provided', function () {
      should(function () { kuzzle.setHeaders(); }).throw(Error);
      should(function () { kuzzle.setHeaders(123); }).throw(Error);
      should(function () { kuzzle.setHeaders('foo'); }).throw(Error);
      should(function () { kuzzle.setHeaders(['mama', 'mia']); }).throw(Error);
    });

    it('should set headers properly', function () {
      should(kuzzle.setHeaders({foo: 'bar'})).be.exactly(kuzzle);
      kuzzle.setHeaders({bar: 'baz', baz: ['bar, baz, qux', 'foo']});
      kuzzle.setHeaders({foo: { bar: 'baz'}});

      should(kuzzle.headers).match({bar: 'baz', baz: ['bar, baz, qux', 'foo'], foo: { bar: 'baz'}});
    });

    it('should replace existing headers if asked to', function () {
      kuzzle.setHeaders({foo: 'bar'});
      kuzzle.setHeaders({}, true);

      should(kuzzle.headers).be.empty();
    });
  });

  describe('#checkToken', function () {
    it('should send the checkToken after call', function () {
      var
        kuzzle,
        stubResults = { foo: 'bar' },
        token = 'fakeToken-eoijaodmowifnw8h';

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.query = function (args, query, opts, cb) {
        should(args.action).be.eql('checkToken');
        should(args.controller).be.eql('auth');
        should(query.body.token).be.eql(token);
        cb(null, {result: stubResults });
      };

      kuzzle.state = 'connected';

      kuzzle.checkToken(token, function (err, res) {
        should(err).be.null();
        should(res).be.eql(stubResults);
      });
    });

    it('should resolve to an error if Kuzzle respond with one', function () {
      var
        kuzzle,
        stubError = { foo: 'bar' },
        token = 'fakeToken-eoijaodmowifnw8h';

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.query = function (args, query, opts, cb) {
        should(args.action).be.eql('checkToken');
        should(args.controller).be.eql('auth');
        should(query.body.token).be.eql(token);
        cb({error: stubError });
      };

      kuzzle.state = 'connected';

      kuzzle.checkToken(token, function (err, res) {
        should(err.error).be.eql(stubError);
        should(res).be.undefined();
      });
    });

    it('should throw an error when it is called with no callback', function (done) {
      var
        kuzzle,
        token = 'fakeToken-eoijaodmowifnw8h';

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.queuing = true;

      try {
        kuzzle.checkToken(token, null);
      } catch (e) {
        should(e).be.an.instanceOf(Error);
      } finally {
        done();
      }
    });
  });

  describe('#whoAmI', function () {
    it('should send the getCurrentUser after call', function () {
      var kuzzle;

      this.timeout(200);

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.queuing = true;

      kuzzle.whoAmI(function (err, res) {});

      should(kuzzle.offlineQueue.length).be.exactly(1);
      should(kuzzle.offlineQueue[0].query.action).be.exactly('getCurrentUser');
      should(kuzzle.offlineQueue[0].query.controller).be.exactly('auth');
    });

    it('should send correct query and return a KuzzleUser', function (done) {
      var kuzzle;

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });
      kuzzle.query = queryStub;

      error = false;
      result = {result: {_id: 'user', _source: {firstName: 'Ada'}}};
      expectedQuery = {
        controller: 'auth',
        action: 'getCurrentUser'
      };

      kuzzle.whoAmI(function (err, res) {
        should(res).instanceof(KuzzleUser);
        done();
      });
    });

    it('should execute the callback with an error if an error occurs', function (done) {
      var kuzzle;

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });
      kuzzle.query = queryStub;

      this.timeout(50);
      error = 'foobar';

      kuzzle.whoAmI(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#security', function () {
    it('should be an instance of KuzzleSecurity', function () {
      var kuzzle;

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      should(kuzzle.security).be.an.instanceOf(KuzzleSecurity);
    });
  });

  describe('#getJwtToken', function () {
    it('should return the current jwt token', function () {
      var kuzzle;

      kuzzle = new Kuzzle('nowhere', {
        connect: 'manual'
      });

      kuzzle.jwtToken = 'testToken';

      should(kuzzle.getJwtToken()).be.exactly('testToken');
    });
  });
});
