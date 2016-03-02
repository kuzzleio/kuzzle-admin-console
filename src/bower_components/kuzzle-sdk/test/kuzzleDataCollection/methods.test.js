var
  should = require('should'),
  rewire = require('rewire'),
  proxyquire = require('proxyquire'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataCollection = rewire('../../src/kuzzleDataCollection'),
  KuzzleDocument = require('../../src/kuzzleDocument'),
  KuzzleDataMapping = require('../../src/kuzzleDataMapping'),
  KuzzleRoom = require('../../src/kuzzleRoom');

describe('KuzzleDataCollection methods', function () {
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
    kuzzle;

  describe('#advancedSearch', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: { foo: 'bar'}} ]}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'search',
        controller: 'read',
        body: {}
      };
    });

    it('should send the right search query to kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = {queuable: false},
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);
      expectedQuery.options = options;
      expectedQuery.body = filters;

      should(collection.advancedSearch(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.documents).be.an.Array();
        should(res.documents.length).be.exactly(result.result.hits.length);

        res.documents.forEach(function (item) {
          should(item).be.instanceof(KuzzleDocument);
        });
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.advancedSearch(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.advancedSearch({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.advancedSearch({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.advancedSearch({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.advancedSearch({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.advancedSearch({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#count', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {count: 42 }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'count',
        controller: 'read',
        body: {}
      };
    });

    it('should send the right count query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false },
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };
      expectedQuery.options = options;
      expectedQuery.body = filters;

      should(collection.count(filters, options, function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(result.result.count);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.count(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.count({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.count({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.count({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.count({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.count({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#create', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {acknowledged: true }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'createCollection',
        controller: 'write'
      };
    });

    it('should send the right createCollection query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.create(options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.be.exactly(result);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.create(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.create({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.create(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#createDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar', _source: { foo: 'bar' }, _version: 1} };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'create',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right createDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.createDocument(result.result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.createDocument('id', {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument('id', {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument('id', {}, {}, function () {});
      should(emitted).be.true();

      collection.createDocument(null, {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(null, {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(null, {}, {}, function () {});
      should(emitted).be.true();

      collection.createDocument(undefined, {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(undefined, {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument(undefined, {}, {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.createDocument({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should handle a document ID if one is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      expectedQuery._id = 'foo';

      collection.createDocument('foo', {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.createDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should be able to handle a KuzzleDocument argument', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        document = new KuzzleDocument(collection, result.result._source);

      should(collection.createDocument(document, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should be able to handle the updateIfExist option', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      expectedQuery.action = 'createOrReplace';

      collection.createDocument(result.result._source, {updateIfExist: true});
      should(emitted).be.true();
    });
  });

  describe('#delete', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { acknowledged: true };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'deleteCollection',
        controller: 'admin'
      };
    });

    it('should send the right deleteCollection query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.delete(options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object().and.be.exactly(result);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.delete(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.delete({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#deleteDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar' } };
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'delete',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.deleteDocument(result.result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match([result.result._id]);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.deleteDocument(result.result._id);
      should(emitted).be.true();

      collection.deleteDocument(result.result._id, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.deleteDocument(result.result._id, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.deleteDocument(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should execute a deleteByQuery if a set of filters is provided', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        filters = { and: [ {term: {foo: 'bar'}}, { ids: ['baz', 'qux'] } ] };

      this.timeout(50);
      expectedQuery.body = filters;
      expectedQuery.action = 'deleteByQuery';
      result = { result: {ids: ['foo', 'bar'] }};

      collection.deleteDocument(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Array().and.match(result.result.ids);
        done();
      });
      should(emitted).be.true();
    });
  });

  describe('#fetchDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar', _source: {foo: 'bar'} }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'get',
        controller: 'read',
        body: {}
      };
    });

    it('should send the right fetchDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.fetchDocument(result.result._id, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.fetchDocument(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchDocument({}); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchDocument({}, {}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.fetchDocument({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.fetchDocument({}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.fetchDocument({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#fetchAllDocuments', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      emitted = false;
    });

    it('should forward the query to the advancedSearch method', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      collection.advancedSearch = function () { emitted = true; };
      expectedQuery.options = options;

      should(collection.fetchAllDocuments(options, function () {})).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.fetchAllDocuments(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.fetchAllDocuments({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.advancedSearch = function () { emitted = true; };

      collection.fetchAllDocuments(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.fetchAllDocuments({}, function () {});
      should(emitted).be.true();
    });
  });

  describe('#getMapping', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {'bar': { mappings: { foo: { properties: {}}}} }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getMapping',
        controller: 'admin',
        body: {}
      };
    });

    it('should instantiate a new KuzzleDataMapping object', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.getMapping(options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDataMapping);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.getMapping(); }).throw(Error);
      should(emitted).be.false();
      should(function () { collection.getMapping({}); }).throw(Error);
      should(emitted).be.false();
    });

    it('should handle the callback argument correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.getMapping(function () {});
      should(emitted).be.true();

      emitted = false;
      collection.getMapping({}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.getMapping({}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#publishMessage', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_source: {foo: 'bar'} }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'publish',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right publish query to Kuzzle', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.publishMessage(result.result._source, options);
      should(emitted).be.true();
    });

    it('should handle a KuzzleDocument object as an argument', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      collection.publishMessage(new KuzzleDocument(collection, result.result._source), options);
      should(emitted).be.true();
    });
  });

  describe('#replaceDocument', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {_id: 'foobar', _source: { foo: 'bar' } }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'createOrReplace',
        controller: 'write',
        body: {}
      };
    });

    it('should send the right replaceDocument query to Kuzzle', function (done) {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.replaceDocument(result.result._id, result.result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.replaceDocument('foo');
      should(emitted).be.true();

      emitted = false;
      collection.replaceDocument('foo', {});
      should(emitted).be.true();

      emitted = false;
      collection.replaceDocument('foo', {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.replaceDocument('foo', {}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.replaceDocument(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#subscribe', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.state = 'connected';
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {roomId: 'foobar' }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'on',
        controller: 'subscribe',
        body: {}
      };
    });

    it('should instantiate a new KuzzleRoom object', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      should(collection.subscribe(expectedQuery.body, {}, function () {})).be.instanceof(KuzzleRoom);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      should(collection.subscribe(expectedQuery.body, function () {})).be.instanceof(KuzzleRoom);
      should(emitted).be.true();
    });

    it('should raise an error if no callback is provided', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);
      should(function () { collection.subscribe({}); }).throw(Error);
      should(emitted).be.false();
    });
  });

  describe('#truncate', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      emitted = false;
      result = { result: {acknowledged: true }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'truncateCollection',
        controller: 'admin',
        body: {}
      };
    });

    it('should send the right truncate query to Kuzzle', function () {
      var
        collection = kuzzle.dataCollectionFactory(expectedQuery.collection),
        options = { queuable: false };

      expectedQuery.options = options;

      should(collection.truncate(options, function () {})).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = kuzzle.dataCollectionFactory(expectedQuery.collection);

      collection.truncate();
      should(emitted).be.true();

      emitted = false;
      collection.truncate({});
      should(emitted).be.true();

      emitted = false;
      collection.truncate({}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.truncate(function () {});
      should(emitted).be.true();
    });
  });

  describe('#updateDocument', function () {
    var
      revert,
      refreshed = false;

    beforeEach(function () {
      revert = KuzzleDataCollection.__set__('KuzzleDocument', function (collection) {
        var doc = new KuzzleDocument(collection, 'foo', {});

        doc.refresh = function (cb) {
          refreshed = true;
          cb(null, doc);
        };

        return doc;
      });

      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;

      emitted = false;
      result = { result: {_id: 'foobar', _source: { foo: 'bar' } }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'update',
        controller: 'write',
        body: {}
      };
    });

    afterEach(function () {
      revert();
    });

    it('should send the right updateDocument query to Kuzzle', function (done) {
      var
        collection = new KuzzleDataCollection(kuzzle, expectedQuery.index, expectedQuery.collection),
        options = { queuable: false };
      expectedQuery.options = options;

      should(collection.updateDocument(result.result._id, result.result._source, options, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleDocument);
        should(refreshed).be.true();
        done();
      })).be.exactly(collection);
      should(emitted).be.true();
    });

    it('should handle arguments correctly', function () {
      var collection = new KuzzleDataCollection(kuzzle, expectedQuery.index, expectedQuery.collection);

      collection.updateDocument('foo');
      should(emitted).be.true();

      emitted = false;
      collection.updateDocument('foo', {});
      should(emitted).be.true();

      emitted = false;
      collection.updateDocument('foo', {}, function () {});
      should(emitted).be.true();

      emitted = false;
      collection.updateDocument('foo', {}, {}, function () {});
      should(emitted).be.true();
    });

    it('should call the callback with an error if one occurs', function (done) {
      var collection = new KuzzleDataCollection(kuzzle, expectedQuery.index, expectedQuery.collection);
      error = 'foobar';
      this.timeout(50);

      collection.updateDocument(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#factories', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    });

    it('documentFactory should return a new KuzzleDocument object', function () {
      should(kuzzle.dataCollectionFactory('foo').documentFactory('foo', { foo: 'bar'})).be.instanceof(KuzzleDocument);
    });

    it('roomFactory should return a new KuzzleRoom object', function () {
      should(kuzzle.dataCollectionFactory('foo').roomFactory()).be.instanceof(KuzzleRoom);
    });

    it('dataMappingFactory should return a KuzzleDataMapping object', function () {
      should(kuzzle.dataCollectionFactory('foo').dataMappingFactory({})).be.instanceof(KuzzleDataMapping);
    });
  });
});