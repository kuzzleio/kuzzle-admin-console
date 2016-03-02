var
  should = require('should'),
  bluebird = require('bluebird'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../../src/kuzzle'),
  KuzzleRole = require('../../../src/security/kuzzleRole');

describe('KuzzleRole constructor', function () {
  var
    kuzzle;

  before(function () {
    Kuzzle.prototype.bluebird = bluebird;
  });

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
  });

  it('should throw an error if no id is provided', done => {
    try {
      new KuzzleRole(kuzzle.security, null, null);
    }
    catch (e) {
      should(e).be.Error();
      return done();
    }

    return done(new Error('Constructor doesn\'t throw an Error'));
  });

  it('should initialize properties and return a valid KuzzleProfile object', function () {
    var
      kuzzle = new Kuzzle('foo'),
      kuzzleRole = new KuzzleRole(kuzzle.security, 'id', {some: 'content'});


    should(kuzzleRole).be.instanceof(KuzzleRole);
    should(kuzzleRole).have.propertyWithDescriptor('deleteActionName', { enumerable: false, writable: false, configurable: false });
    should(kuzzleRole.deleteActionName).be.exactly('deleteRole');
  });

  it('should expose functions', function () {
    var kuzzleRole = new KuzzleRole(kuzzle.security, 'test', {});

    should.exist(kuzzleRole.setContent);
    should.exist(kuzzleRole.serialize);
    should.exist(kuzzleRole.savePromise);
    should.exist(kuzzleRole.deletePromise);
  });

  it('should handle provided arguments correctly', function () {
    var kuzzleRole = new KuzzleRole(kuzzle.security, 'test', {});

    should(kuzzleRole).be.instanceof(KuzzleRole);
    should(kuzzleRole.id).be.exactly('test');
    should(kuzzleRole.content).be.empty();

    kuzzleRole = new KuzzleRole(kuzzle.security, 'test', {some: 'content'});
    should(kuzzleRole.id).be.exactly('test');
    should(kuzzleRole.content).match({some: 'content'});
  });
});