var
  should = require('should'),
  bluebird = require('bluebird'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../../src/kuzzle'),
  KuzzleSecurity = require('../../../src/security/kuzzleSecurity');

describe('kuzzleSecurity constructor', function () {
  it('should initialize properties and return a valid kuzzleSecurity object', function () {
    var
      kuzzle = new Kuzzle('foo');

    should(kuzzle.security).be.instanceof(KuzzleSecurity);
    should(kuzzle.security).have.propertyWithDescriptor('kuzzle', { enumerable: false, writable: false, configurable: false });
    should(kuzzle.security).have.propertyWithDescriptor('buildQueryArgs', { enumerable: false, writable: false, configurable: false });
    should(kuzzle.security.kuzzle).be.exactly(kuzzle);
  });

  it('should promisify the right functions', () => {
    var
      kuzzle;

    Kuzzle.prototype.bluebird = bluebird;
    kuzzle = new Kuzzle('foo');

    should.exist(kuzzle.security.createRolePromise);
    should.exist(kuzzle.security.getRolePromise);
    should.exist(kuzzle.security.searchRolesPromise);
    should.exist(kuzzle.security.deleteRolePromise);
    should.exist(kuzzle.security.createProfilePromise);
    should.exist(kuzzle.security.getProfilePromise);
    should.exist(kuzzle.security.searchProfilesPromise);
    should.exist(kuzzle.security.deleteProfilePromise);
    should.exist(kuzzle.security.createUserPromise);
    should.exist(kuzzle.security.getUserPromise);
    should.exist(kuzzle.security.searchUsersPromise);
    should.exist(kuzzle.security.deleteUserPromise);

    should.not.exist(kuzzle.security.roleFactoryPromise);
    should.not.exist(kuzzle.security.profileFactoryPromise);
    should.not.exist(kuzzle.security.userFactoryPromise);
  });
});