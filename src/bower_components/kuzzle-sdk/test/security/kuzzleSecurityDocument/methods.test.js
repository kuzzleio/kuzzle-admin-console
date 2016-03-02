var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleSecurityDocument = require('../../../src/security/kuzzleSecurityDocument');

describe('KuzzleSecurityDocument methods', function () {
  var
    securityDocument,
    kuzzle = new Kuzzle('http://localhost:7512');

  describe('#toJSON', function () {
    before(function () {
      securityDocument = new KuzzleSecurityDocument(kuzzle.security, 'myId', {some: 'content'});
    });

    it('should serialize itself properly', function () {
      var
        serialized = securityDocument.serialize();

      should(serialized._id).be.exactly('myId');
      should(serialized.body).match({some: 'content'});
    });
  });


  describe('#setContent', function () {
    before(function () {
      securityDocument = new KuzzleSecurityDocument(kuzzle.security, 'myId', {some: 'content'});
    });

    it('should replace the current security document', function () {
      var serialized;

      securityDocument.setContent({other: 'content'});
      serialized = securityDocument.serialize();

      should(serialized.body).match({other: 'content'});
    });
  });
});
