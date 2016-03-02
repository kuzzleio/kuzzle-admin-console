var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataMapping = rewire('../../src/kuzzleDataMapping');

describe('KuzzleDataMapping methods', function () {
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

  describe('#apply', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {_source: { properties: { foo: {type: 'date'}}}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'updateMapping',
        controller: 'admin',
        body: result.result._source
      };
    });

    it('should call the right updateMapping query when invoked', function (done) {
      var
        refreshed = false,
        mapping = new KuzzleDataMapping(dataCollection, result.result._source.properties);

      this.timeout(50);
      expectedQuery.options = { queuable: false};
      mapping.refresh = function (options, cb) {
        refreshed = true;
        cb(null, mapping);
      };

      should(mapping.apply(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(refreshed).be.true();
        should(err).be.null();
        should(res).be.exactly(mapping);
        done();
      })).be.exactly(mapping);
    });

    it('should handle arguments correctly', function () {
      var
        refreshed = false,
        mapping = new KuzzleDataMapping(dataCollection, result.result._source.properties);

      mapping.refresh = function (options, cb) {
        refreshed = true;

        if (cb) {
          cb(null, mapping);
        }
      };

      mapping.apply();
      should(emitted).be.true();
      should(refreshed).be.true();

      emitted = false;
      refreshed = false;
      mapping.apply({});
      should(emitted).be.true();
      should(refreshed).be.true();

      emitted = false;
      refreshed = false;
      mapping.apply(function () {});
      should(emitted).be.true();
      should(refreshed).be.true();

      emitted = false;
      refreshed = false;
      mapping.apply({}, function () {});
      should(emitted).be.true();
      should(refreshed).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection, result.result._source.properties);

      this.timeout(50);
      error = 'foobar';

      mapping.apply();
      should(emitted).be.true();

      emitted = false;
      mapping.apply((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#refresh', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {bar: { mappings: { foo: { properties: { foo: {type: 'date'}}}}}}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'getMapping',
        controller: 'admin',
        body: {}
      };
    });

    it('should call the right getMapping query when invoked', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection);

      this.timeout(50);
      expectedQuery.options = { queuable: false};

      should(mapping.refresh(expectedQuery.options, function (err, res) {
        should(emitted).be.true();
        should(err).be.null();
        should(res).be.exactly(mapping);
        should(res.mapping).match(result.result[dataCollection.index].mappings.foo.properties);
        done();
      })).be.exactly(mapping);
    });

    it('should handle arguments correctly', function () {
      var mapping = new KuzzleDataMapping(dataCollection);

      mapping.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.refresh({}, function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.refresh(function () {});
      should(emitted).be.true();

      emitted = false;
      mapping.refresh({});
      should(emitted).be.true();
    });

    it('should invoke the callback with an error if one occurs', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection);

      this.timeout(50);
      error = 'foobar';

      mapping.refresh();
      should(emitted).be.true();

      emitted = false;
      mapping.refresh((err, res) => {
        should(emitted).be.true();
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should return a "no mapping" error if the index is not found in the mapping', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection);

      result = { result: {foobar: { mappings: { foo: { properties: { foo: {type: 'date'}}}}}}};

      mapping.refresh((err, res) => {
        should(emitted).be.true();
        should(err).be.an.Error();
        should(err.message).startWith('No mapping found for index');
        should(res).be.undefined();
        done();
      });
    });

    it('should return a "no mapping" error if the index is not found in the mapping', function (done) {
      var mapping = new KuzzleDataMapping(dataCollection);

      result = { result: {bar: { mappings: { foobar: { properties: { foo: {type: 'date'}}}}}}};

      mapping.refresh((err, res) => {
        should(emitted).be.true();
        should(err).be.an.Error();
        should(err.message).startWith('No mapping found for collection');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#set', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should allow setting a field mapping', function () {
      var mapping = new KuzzleDataMapping(dataCollection);

      should(mapping.set('foo', { type: 'date'})).be.exactly(mapping);
      should(mapping.mapping.foo).match({type: 'date'});

      mapping.set('bar', {type: 'string'});
      should(mapping.mapping.bar).match({type: 'string'});

      mapping.set('foo', {type: 'string'});
      should(mapping.mapping.bar).match({type: 'string'});
    });
  });

  describe('#setHeaders', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
    });

    it('should allow setting headers', function () {
      var
        mapping = new KuzzleDataMapping(dataCollection),
        header = {_id: 'foobar'};

      should(mapping.setHeaders(header)).be.exactly(mapping);
      should(mapping.headers).match(header);

      expectedQuery._id = 'foobar';
      mapping.apply();
      should(emitted).be.true();
    });
  });
});