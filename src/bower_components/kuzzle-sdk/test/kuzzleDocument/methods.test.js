var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDocument = rewire('../../src/kuzzleDocument'),
  KuzzleRoom = require('../../src/kuzzleRoom');

describe('KuzzleDocument methods', function () {
  var
    expectedQuery,
    error,
    result,
    queryStub = function (args, query, options, cb) {
      emitted = true;
      should(args.index).be.exactly(expectedQuery.index);
      should(args.collection).be.exactly(expectedQuery.collection);
      should(args.controller).be.exactly(expectedQuery.controller);
      should(args.action).be.exactly(expectedQuery.action);

      if (expectedQuery.options) {
        should(options).match(expectedQuery.options);
      }

      if (expectedQuery.body) {
        if (!query.body) {
          query.body = {};
        }

        should(query.body).match(expectedQuery.body);
      } else {
        should(Object.keys(query).length).be.exactly(0);
      }

      if (expectedQuery._id) {
        should(query._id).be.exactly(expectedQuery._id);
      }

      if (cb) {
        if (error) {
          return cb(error);
        }

        cb(error, result);
      }
    },
    emitted,
    kuzzle,
    dataCollection;

  describe('#toJSON', function () {
    before(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should serialize itself properly', function () {
      var
        document = new KuzzleDocument(dataCollection, {some: 'content'}),
        serialized = document.serialize();

      should(serialized._id).be.undefined();
      should(serialized._version).be.undefined();
      should(serialized.body).be.an.Object().and.match({some: 'content'});

      document.id = 'foo';
      serialized = document.serialize();
      should(serialized._id).be.exactly('foo');
      should(serialized._version).be.undefined();
      should(serialized.body).be.an.Object().and.match({some: 'content'});

      document.version = 42;
      serialized = document.serialize();
      should(serialized._id).be.exactly('foo');
      should(serialized._version).be.exactly(42);
      should(serialized.body).be.an.Object().and.match({some: 'content'});
    });
  });

  describe('#toString', function () {
    before(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should stringify itself properly', function () {
      var
        document = new KuzzleDocument(dataCollection, 'id', {some: 'content', _version: 42}),
        serialized = document.serialize(),
        stringified = document.toString();

      should(stringified).be.a.String();
      should(JSON.parse(stringified)).be.an.Object().and.match(serialized);
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = {};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'delete',
        controller: 'write',
        body: {},
        _id: 'foo'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new KuzzleDocument(dataCollection);

      expectedQuery.options = options;
      document.id = 'foo';
      should(document.delete(options)).be.exactly(document);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var document = new KuzzleDocument(dataCollection);

      document.id = 'foo';
      document.delete(function () {});
      should(emitted).be.true();

      emitted = false;
      document.delete();
      should(emitted).be.true();

      emitted = false;
      document.delete({}, function () {});
      should(emitted).be.true();

      emitted = false;
      document.delete({});
      should(emitted).be.true();
    });

    it('should throw an error if no ID has been set', function () {
      var document = new KuzzleDocument(dataCollection);

      should(function () { document.delete(); }).throw(Error);
      should(emitted).be.false();
    });

    it('should resolve the callback with itself as a result', function (done) {
      var document = new KuzzleDocument(dataCollection);

      this.timeout(50);
      document.id = 'foo';

      document.delete(function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(document);
        done();
      });
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new KuzzleDocument(dataCollection);

      this.timeout(50);
      document.id = 'foo';
      error = 'foobar';

      document.delete(function (err, res) {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    })
  });

  describe('#refresh', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {_id: 'foo', _version: 42, _source: {some: 'content'}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'get',
        controller: 'read',
        body: {},
        _id: 'foo'
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new KuzzleDocument(dataCollection);

      expectedQuery.options = options;
      document.id = 'foo';
      should(document.refresh(options, function () {})).be.undefined();
      should(emitted).be.true();
    });

    it('should throw an error if no callback is provided', function () {
      var
        document = new KuzzleDocument(dataCollection);

      document.id = 'foo';
      should(function () { document.refresh(); }).throw();
    });

    it('should handle arguments correctly', function () {
      var document = new KuzzleDocument(dataCollection);

      document.id = 'foo';
      document.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      document.refresh({}, function () {});
      should(emitted).be.true();
    });

    it('should throw an error if no ID has been set', function () {
      var document = new KuzzleDocument(dataCollection);

      should(function () { document.refresh(); }).throw(Error);
      should(emitted).be.false();
    });

    it('should resolve the callback with itself as a result', function (done) {
      var document = new KuzzleDocument(dataCollection);

      this.timeout(50);
      document.id = 'foo';

      document.refresh(function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument).and.not.be.eql(document);
        should(res.id).be.eql(document.id);
        should(res.version).be.exactly(42);
        should(res.content).match({some:'content'});
        done();
      });
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new KuzzleDocument(dataCollection);

      this.timeout(50);
      document.id = 'foo';
      error = 'foobar';

      document.refresh(function (err, res) {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#save', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = {result: { _id: 'foo', _version: 42}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'createOrReplace',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new KuzzleDocument(dataCollection);

      expectedQuery.options = options;
      document.id = 'foo';
      should(document.save(options)).be.exactly(document);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var document = new KuzzleDocument(dataCollection);

      document.save(function () {});
      should(emitted).be.true();

      emitted = false;
      document.save();
      should(emitted).be.true();

      emitted = false;
      document.save({}, function () {});
      should(emitted).be.true();

      emitted = false;
      document.save({});
      should(emitted).be.true();
    });

    it('should resolve the callback with itself as a result', function (done) {
      var document = new KuzzleDocument(dataCollection);

      this.timeout(50);

      document.save(function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(document);
        should(res.id).be.exactly('foo');
        should(res.version).be.exactly(42);
        done();
      });
    });

    it('should revolve the callback with an error if one occurs', function (done) {
      var document = new KuzzleDocument(dataCollection);

      this.timeout(50);
      error = 'foobar';

      document.save(function (err, res) {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    })
  });

  describe('#publish', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = {};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'publish',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right query to Kuzzle', function () {
      var
        options = { queuable: false },
        document = new KuzzleDocument(dataCollection);

      expectedQuery.options = options;
      should(document.publish(options)).be.exactly(document);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var document = new KuzzleDocument(dataCollection);

      document.publish();
      should(emitted).be.true();

      emitted = false;
      document.publish({});
      should(emitted).be.true();
    });
  });

  describe('#setContent', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should update the content if "replace" is falsey', function () {
      var document = new KuzzleDocument(dataCollection);

      document.content = { foo: 'foo', bar: 'bar' };
      should(document.setContent({foo: 'foobar'})).be.exactly(document);
      document.setContent({qux: 'qux'}, false);
      should(document.content).match({foo: 'foobar', bar: 'bar', qux: 'qux'});
    });

    it('should replace the current content if "replace" is true', function () {
      var document = new KuzzleDocument(dataCollection);

      document.content = { foo: 'foo', bar: 'bar' };
      should(document.setContent({foo: 'foobar'}, true)).be.exactly(document);
      should(document.content).match({foo: 'foobar'});
    });
  });

  describe('#subscribe', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      kuzzle.state = 'connected';
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {roomId: 'foo', channel: 'bar'}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'on',
        controller: 'subscribe',
        body: {}
      };
    });

    it('should return a new KuzzleRoom object', function () {
      var
        document = new KuzzleDocument(dataCollection);

      document.id = 'foo';
      should(document.subscribe({}, function () {})).be.instanceof(KuzzleRoom);
      should(emitted).be.true();
    });

    it('should handle arguments properly', function () {
      var document = new KuzzleDocument(dataCollection);

      document.id = 'foo';
      document.subscribe(function () {});
      should(emitted).be.true();
    });

    it('should throw an error if no ID is provided', function () {
      var document = new KuzzleDocument(dataCollection);

      should(function () { document.subscribe(function () {}); }).throw(Error);
      should(emitted).be.false();
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should properly set headers', function () {
      var
        document = new KuzzleDocument(dataCollection);
        header = {_id: 'foobar'};

      should(document.setHeaders(header)).be.exactly(document);
      should(document.headers).match(header);
    });
  });
});
