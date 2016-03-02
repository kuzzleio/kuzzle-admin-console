var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleProfile = require('../../../src/security/kuzzleProfile'),
  KuzzleRole = require('../../../src/security/kuzzleRole'),
  KuzzleUser = require('../../../src/security/kuzzleUser');

describe('KuzzleRole methods', function () {
  var
    kuzzle,
    kuzzleUser,
    result,
    expectedQuery,
    error = false,
    queryStub = function (args, query, options, cb) {
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
        should(query.body).be.undefined();
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
    };

  describe('#save', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'myUser', _source: {some: 'content', profile: 'myProfile'}} };
      kuzzleUser = new KuzzleUser(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceUser',
        controller: 'security'
      };
    });

    it('should throw an error if the user has not profile parameter', function (done) {
      kuzzleUser = new KuzzleUser(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        kuzzleUser.save();
      })).throw(Error);

      done();
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleUser.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      error = 'foobar';

      kuzzleUser.save(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#update', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'myUser', _index: '%kuzzle', _type: 'users'} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, {indexes : {}});
      expectedQuery = {
        action: 'updateUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzleUser.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      kuzzleUser.update({'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should raise an error if no content given', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      this.timeout(50);

      try {
        kuzzleUser.update();
      }
      catch(error) {
        should(error).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#setProfile', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'myUser', {profile: 'profile1'});
    });

    it('should throw an error if the profile parameter is null', function (done) {
      should((function () {
        kuzzleUser.setProfile(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the profile parameter is not a string', function (done) {
      should((function () {
        kuzzleUser.setProfile(1);
      })).throw(Error);

      done();
    });

    it('should add the id string in profile', function (done) {
      kuzzleUser.setProfile('role2');
      should(kuzzleUser.content.profile).be.exactly('role2');
      done();
    });

    it('should add the KuzzleProfile in profile', function (done) {
      var
        kuzzleProfile = new KuzzleProfile(kuzzle.security, 'profile2', {roles: ['role1']});

      kuzzleUser.setProfile(kuzzleProfile);
      should(kuzzleUser.content.profile).match({id: 'profile2', content: {roles: ['role1']}});
      should(kuzzleUser.content.profile).be.instanceOf(KuzzleProfile);
      done();
    });
  });

  describe('#hydrate', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');

      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'user', _source: {profile : 'profile1'}} };
      kuzzleUser = new KuzzleUser(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'getProfile',
        controller: 'security'
      };
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzleUser.hydrate(); }).throw(Error);
    });

    it('should send the right query to kuzzle', function (done) {
      should(kuzzleUser.hydrate(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should throw an error when the profile is already a KuzzleProfile', function (done) {
      var kuzzleProfile = new KuzzleProfile(kuzzle.security, 'profile', {roles: ['role1']});
      kuzzleUser.setProfile(kuzzleProfile);

      should(function () { kuzzleUser.hydrate(function () {}); }).throw(Error);
      done();
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';

      kuzzleUser.hydrate(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profile: 'profile'});
    });

    it('should serialize with correct attributes', function (done) {
      var serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).be.match({some: 'content', profile: 'profile'});
      done();
    });

    it('should serialize with correct attributes when a user is serialized', function (done) {
      var
        kuzzleProfile = new KuzzleProfile(kuzzle.security, 'profile1', {some: 'content', roles: ['role1']}),
        serialized;

      kuzzleUser.setProfile(kuzzleProfile);

      serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should(serialized.body).be.match({some: 'content', profile: 'profile1'});
      done();
    });

    it('should serialize without roles if no profile attribute is defined', function (done) {
      var
        serialized;

      kuzzleUser = new KuzzleProfile(kuzzle.security, 'user', {some: 'content'});

      serialized = kuzzleUser.serialize();

      should(serialized._id).be.exactly('user');
      should.exist(serialized.body.some);
      should.not.exist(serialized.body.profile);
      done();
    });
  });

  describe('#delete', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'user'} };
      kuzzleUser = new KuzzleUser(kuzzle.security, 'user', {some: 'content', profile: 'role1'});
      expectedQuery = {
        action: 'deleteUser',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleUser.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';

      kuzzleUser.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

});
