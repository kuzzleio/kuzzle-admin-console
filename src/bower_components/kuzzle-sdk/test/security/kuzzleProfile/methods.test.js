var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleProfile = require('../../../src/security/kuzzleProfile'),
  KuzzleRole = require('../../../src/security/kuzzleRole');

describe('KuzzleRole methods', function () {
  var
    kuzzle,
    kuzzleProfile,
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

      result = { result: {_id: 'myProfile', _source: {roles : []}} };
      kuzzleProfile = new KuzzleProfile(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceProfile',
        controller: 'security'
      };
    });

    it('should throw an error if the profile has not roles parameter', function (done) {
      kuzzleProfile = new KuzzleProfile(kuzzle.security, result.result._id, {some: 'content'});

      should((function () {
        kuzzleProfile.save();
      })).throw(Error);

      done();
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleProfile.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleProfile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      error = 'foobar';
      this.timeout(50);

      kuzzleProfile.save(function (err, res) {
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

      result = { result: {_id: 'myProfile', _index: '%kuzzle', _type: 'profiles'} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, {indexes : {}});
      expectedQuery = {
        action: 'updateProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzleProfile.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleProfile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      kuzzleProfile.update({'foo': 'bar'}, function (err, res) {
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
        kuzzleProfile.update();
      }
      catch(error) {
        should(error).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#addRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {roles: ['role1']});
    });

    it('should throw an error if the role is not an id or a KuzzleRole', function (done) {
      should((function () {
        kuzzleProfile.addRole(null);
      })).throw(Error);

      done();
    });

    it('should add the id string in roles list', function (done) {
      kuzzleProfile.addRole('role2');
      should(kuzzleProfile.content.roles).be.an.Array().match(['role1', 'role2']);
      done();
    });

    it('should add the KuzzleRole in roles list', function (done) {
      var
        kuzzleRole = new KuzzleRole(kuzzle.security, 'role3', {indexes: {}});

      kuzzleProfile.addRole(kuzzleRole);
      should(kuzzleProfile.content.roles).be.an.Array();
      should(kuzzleProfile.content.roles.length).be.exactly(2);
      done();
    });

    it('should initialize roles with array if no role was set before', function (done) {
      var
        kuzzleRole = new KuzzleRole(kuzzle.security, 'role3', {indexes: {}});

      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content'});

      kuzzleProfile.addRole(kuzzleRole);
      should(kuzzleProfile.content.roles).be.an.Array();
      should(kuzzleProfile.content.roles.length).be.exactly(1);
      done();
    });
  });

  describe('#setRoles', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {roles: ['role1']});
    });

    it('should throw an error if the roles parameter is null', function (done) {
      should((function () {
        kuzzleProfile.setRoles(null);
      })).throw(Error);

      done();
    });

    it('should throw an error if the role parameter is not a array of string', function (done) {
      should((function () {
        kuzzleProfile.setRoles([1, 2, 3]);
      })).throw(Error);

      done();
    });

    it('should add the id string in roles list', function (done) {
      kuzzleProfile.setRoles(['role2']);
      should(kuzzleProfile.content.roles).be.an.Array().match(['role2']);
      done();
    });

    it('should add the KuzzleRole in roles list', function (done) {
      var
        kuzzleRole1 = new KuzzleRole(kuzzle.security, 'role2', {indexes: {}}),
        kuzzleRole2 = new KuzzleRole(kuzzle.security, 'role3', {indexes: {}});

      kuzzleProfile.setRoles([kuzzleRole1, kuzzleRole2]);
      should(kuzzleProfile.content.roles).be.an.Array();
      should(kuzzleProfile.content.roles.length).be.exactly(2);
      done();
    });
  });

  describe('#hydrate', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');

      kuzzle.query = queryStub;
      error = false;

      result = { result: {hits: [{_id: 'role1', _source: {indexes: {}}}, {_id: 'role2', _source: {indexes: {}}}]}};
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'profile', {roles: result.result.hits});
      expectedQuery = {
        action: 'mGetRoles',
        controller: 'security'
      };
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzleProfile.hydrate(); }).throw(Error);
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {ids: ['role1', 'role2']};

      should(kuzzleProfile.hydrate(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleProfile);
        should(res.content.roles).be.an.Array();
        should(res.content.roles).not.be.empty();

        res.content.roles.forEach(function (role) {
          should(role).instanceof(KuzzleRole);
        });

        done();
      }));
    });

    it('should send the right query to kuzzle when a KuzzleRole is added', function (done) {
      var kuzzleRole = new KuzzleRole(kuzzle.security, 'role3', {indexes: {}});
      expectedQuery.body = {ids: ['role1', 'role3']};

      kuzzleProfile.setRoles(['role1', kuzzleRole]);

      should(kuzzleProfile.hydrate(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleProfile);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      var kuzzleRole = new KuzzleRole(kuzzle.security, 'role3', {indexes: {}});
      expectedQuery.body = {ids: ['role1', 'role3']};

      error = 'foobar';
      this.timeout(50);

      kuzzleProfile.setRoles(['role1', kuzzleRole]);

      kuzzleProfile.hydrate(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#serialize', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content', roles: ['role1']});
    });

    it('should serialize with correct attributes', function (done) {
      var serialized = kuzzleProfile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should(serialized.body).be.match({some: 'content', roles: ['role1']});
      done();
    });

    it('should serialize with correct attributes when a role is serialized', function (done) {
      var
        kuzzleRole = new KuzzleRole(kuzzle.security, 'role2', {indexes: {}}),
        serialized;

      kuzzleProfile.setRoles([kuzzleRole]);

      serialized = kuzzleProfile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should(serialized.body).be.match({some: 'content', roles: ['role2']});
      done();
    });

    it('should serialize without roles if no roles attribute is defined', function (done) {
      var
        serialized;

      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content'});

      serialized = kuzzleProfile.serialize();

      should(serialized._id).be.exactly('myProfile');
      should.exist(serialized.body.some);
      should.not.exist(serialized.body.roles);
      done();
    });
  });

  describe('#delete', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'myProfile'} };
      kuzzleProfile = new KuzzleProfile(kuzzle.security, 'myProfile', {some: 'content', roles: ['role1']});
      expectedQuery = {
        action: 'deleteProfile',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleProfile.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';

      kuzzleProfile.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

});
