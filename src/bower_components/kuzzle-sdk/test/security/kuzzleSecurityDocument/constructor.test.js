var
  should = require('should'),
  bluebird = require('bluebird'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../../src/kuzzle'),
  KuzzleSecurityDocument = require('../../../src/security/kuzzleSecurityDocument');

describe('KuzzleSecurityDocument constructor', function () {
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
      new KuzzleSecurityDocument(kuzzle.security, null, null);
    }
    catch (e) {
      should(e).be.Error();
      return done();
    }

    return done(new Error('Constructor doesn\'t throw an Error'));
  });


  it('should expose securityDocument properties with the right permissions', function () {
    var securityDocument = new KuzzleSecurityDocument(kuzzle.security, 'test', {});

    should(securityDocument).have.propertyWithDescriptor('kuzzle', { enumerable: false, writable: false, configurable: false });
    should(securityDocument).have.propertyWithDescriptor('kuzzleSecurity', { enumerable: false, writable: false, configurable: false });
    should(securityDocument).have.propertyWithDescriptor('id', { enumerable: true, writable: false, configurable: false });
    should(securityDocument).have.propertyWithDescriptor('content', { enumerable: true, writable: true, configurable: false });
  });

  it('should expose functions', function () {
    var securityDocument = new KuzzleSecurityDocument(kuzzle.security, 'test', {});

    should.exist(securityDocument.setContent);
    should.exist(securityDocument.serialize);
  });

  it('should handle provided arguments correctly', function () {
    var securityDocument = new KuzzleSecurityDocument(kuzzle.security, 'test', {});

    should(securityDocument).be.instanceof(KuzzleSecurityDocument);
    should(securityDocument.id).be.exactly('test');
    should(securityDocument.content).be.empty();

    securityDocument = new KuzzleSecurityDocument(kuzzle.security, 'test', {some: 'content'});
    should(securityDocument.id).be.exactly('test');
    should(securityDocument.content).match({some: 'content'});
  });
});