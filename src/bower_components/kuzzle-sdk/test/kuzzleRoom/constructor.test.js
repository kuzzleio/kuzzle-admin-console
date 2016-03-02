var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleRoom = rewire('../../src/kuzzleRoom');

describe('KuzzleRoom constructor', function () {
  var
    kuzzle,
    dataCollection;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('nowhere', {defaultIndex: 'bar'});

    kuzzle.headers = {foo: 'bar'};
    dataCollection = kuzzle.dataCollectionFactory('foo');
  });

  it('should handle provided arguments correctly', function () {
    var room = new KuzzleRoom(dataCollection);

    should(room.metadata).be.an.Object().and.be.empty();
    should(room.subscribeToSelf).be.true();
    should(room.scope).be.exactly('all');
    should(room.state).be.exactly('done');
    should(room.users).be.exactly('none');
    should(room.collection).be.exactly(dataCollection);
    should(room.filters).be.null();
    should(room.headers).match({foo: 'bar'});
    should(room.roomId).be.null();

    room = new KuzzleRoom(dataCollection, {
      scope: 'in',
      state: 'pending',
      users: 'all',
      metadata: {some: 'metadata'},
      subscribeToSelf: false
    });

    should(room.metadata).match({some: 'metadata'});
    should(room.subscribeToSelf).be.false();
    should(room.scope).be.exactly('in');
    should(room.state).be.exactly('pending');
    should(room.users).be.exactly('all');
  });

  it('should expose documented properties with the right permissions', function () {
    var room = new KuzzleRoom(dataCollection);

    should(room).have.propertyWithDescriptor('collection', {enumerable: true, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('filters', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('headers', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('scope', {enumerable: false, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('state', {enumerable: false, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('users', {enumerable: false, writable: false, configurable: false});
    should(room).have.propertyWithDescriptor('metadata', {enumerable: true, writable: true, configurable: false});
    should(room).have.propertyWithDescriptor('subscribeToSelf', {
      enumerable: true,
      writable: true,
      configurable: false
    });
    should(room).have.propertyWithDescriptor('roomId', {enumerable: true, writable: true, configurable: false});
  });

  it('should promisify the right functions', function () {
    var room = new KuzzleRoom(dataCollection);

    should.exist(room.countPromise);
    should.not.exist(room.renewPromise);
    should.not.exist(room.setHeadersPromise);
    should.not.exist(room.unsubscribePromise);
  });
});
