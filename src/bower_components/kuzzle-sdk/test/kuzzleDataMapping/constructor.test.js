var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleDataMapping = rewire('../../src/kuzzleDataMapping');

describe('KuzzleDataMapping constructor', function () {
  var
    kuzzle,
    collection;

  before(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});

  });

  beforeEach(function () {
    collection = kuzzle.dataCollectionFactory('foo');
  });

  it('should create a new instance even if no mapping has been provided', function () {
    var mapping = new KuzzleDataMapping(collection);
    should(mapping.mapping).be.an.Object().and.be.empty();
  });

  it('should take mappings from arguments if provided', function () {
    var
      mappings = { foo: {type: 'string'}, bar: {type: 'float'}},
      mapping = new KuzzleDataMapping(collection, mappings);

    should(mapping.mapping).match(mappings);
  });

  it('should expose documented properties with the right permissions', function () {
    var mapping = new KuzzleDataMapping(collection);

    should(mapping).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
    should(mapping).have.propertyWithDescriptor('mapping', { enumerable: true, writable: true, configurable: false });
  });

  it('should initialize headers coming from the provided data collection object', function () {
    var
      headers = {foo: 'bar'},
      mapping;

    collection.headers = headers;
    mapping = new KuzzleDataMapping(collection);
    should(mapping.headers).match(headers);
  });

  it('should promisify the right functions', function () {
    var
      kuzzle,
      mapping;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
    mapping = new KuzzleDataMapping(kuzzle.dataCollectionFactory('foo'));

    should.exist(mapping.applyPromise);
    should.exist(mapping.refreshPromise);
    should.not.exist(mapping.setPromise);
    should.not.exist(mapping.setHeadersPromise);
  });
});
