var
  should = require('should'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleRole = require('../../../src/security/kuzzleRole'),
  KuzzleProfile = require('../../../src/security/kuzzleProfile'),
  KuzzleUser = require('../../../src/security/kuzzleUser');

describe('KuzzleSecurity user methods', function () {
  var
    kuzzle,
    expectedQuery,
    result,
    error,
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

  describe('#getUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {profile: {_id: 'profile', _source: {roles: [{_id: 'role', _source: {indexes: {}}}]}}} }};
      expectedQuery = {
        action: 'getUser',
        controller: 'security',
        _id: 'foobar'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      should(kuzzle.security.getUser(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);


        should(res.content.profile).instanceof(KuzzleProfile);
        should(res.content.profile.content.roles).be.an.Array();
        should(res.content.profile.content.roles).not.be.empty();

        res.content.profile.content.roles.forEach(function (role) {
          should(role).instanceof(KuzzleRole);
        });

        done();
      }));
    });

    it('should send the right query to Kuzzle with id as profile when hydrate is false', function (done) {
      should(kuzzle.security.getUser(result.result._id, {hydrate: false}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);

        should(res.content.profile).be.a.String();
        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.getUser('test'); }).throw(Error);
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.getUser(null, function () {}); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'error';
      this.timeout(50);

      kuzzle.security.getUser('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#searchUsers', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {profile : 'myProfile'}} ]}};
      expectedQuery = {
        action: 'searchUsers',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle and return user with string', function (done) {
      var
        filters = {};

      this.timeout(50);
      expectedQuery.body = {hydrate: true};

      should(kuzzle.security.searchUsers(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.users).be.an.Array();
        should(res.users).not.be.empty();
        should(res.users.length).be.exactly(result.result.hits.length);

        res.users.forEach(function (item) {
          should(item).be.instanceof(KuzzleUser);

          should(item.content.profile).be.String();
          should(item.content.profile.roles).be.undefined();
        });

        done();
      }));
    });

    it('should send the right search query not hydrated to kuzzle and return user with string', function (done) {
      var
        filters = {};

      this.timeout(50);
      expectedQuery.body = {hydrate: false};

      should(kuzzle.security.searchUsers(filters, {hydrate: false}, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.users).be.an.Array();
        should(res.users).not.be.empty();
        should(res.users.length).be.exactly(result.result.hits.length);

        res.users.forEach(function (item) {
          should(item).be.instanceof(KuzzleUser);

          should(item.content.profile).be.String();
          should(item.content.profile.roles).be.undefined();
        });

        done();
      }));
    });

    it('should send the right search query to kuzzle and return user with profile and role if the user is hydrated', function (done) {
      var
        filters = {};

      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {
        profile: {
          _id: 'myProfile',
          _source: {
            roles: [
              {
                _id: 'myRole',
                _source: {
                  indexes: {}
                }
              }
            ]
          }
        }
      }}]}};

      this.timeout(50);
      expectedQuery.body = filters;

      should(kuzzle.security.searchUsers(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.users).be.an.Array();
        should(res.users).not.be.empty();
        should(res.users.length).be.exactly(result.result.hits.length);

        res.users.forEach(function (item) {
          should(item).be.instanceof(KuzzleUser);

          should(item.content.profile).be.instanceof(KuzzleProfile);
          should(item.content.profile.content.roles).be.an.Array();
          should(item.content.profile.content.roles).not.be.empty();

          item.content.profile.content.roles.map(function (role) {
            should(role).instanceof(KuzzleRole);
          });
        });

        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      var
        filters = {};

      should(function () { kuzzle.security.searchUsers(filters); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      var
        filters = {};

      result = { result: { total: 123, hits: [ {_id: 'foobar', _source: {
        profile: {
          _id: 'myProfile',
          _source: {
            roles: [
              {
                _id: 'myRole',
                _source: {
                  indexes: {}
                }
              }
            ]
          }
        }
      }}]}};

      expectedQuery.body = filters;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.searchUsers(filters, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });


  describe('#createUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {profile: ['myRole']}} };
      expectedQuery = {
        action: 'createUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzle.security.createUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      kuzzle.security.createUser(result.result._id, result.result._source);
      done();
    });

    it('should construct a createOrReplaceUser action if option replaceIfExist is set to true', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createOrReplaceUser';

      should(kuzzle.security.createUser(result.result._id, result.result._source, {replaceIfExist: true}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should construct a createUser action if option replaceIfExist is set to false', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createUser';

      should(kuzzle.security.createUser(result.result._id, result.result._source, {replaceIfExist: false}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleUser);
        done();
      }));
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createUser(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.createUser(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#updateUser', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'users'} };
      expectedQuery = {
        action: 'updateUser',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzle.security.updateUser(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      kuzzle.security.updateUser(result.result._id, {'foo': 'bar'});
      done();
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateUser(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.updateUser(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#deleteRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar'} };
      expectedQuery = {
        action: 'deleteUser',
        controller: 'security',
        _id: result.result._id
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      should(kuzzle.security.deleteUser(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should send the right delete query to Kuzzle even without callback', function (done) {
      kuzzle.security.deleteUser(result.result._id);
      done();
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.deleteUser(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#ProfileFactory', function () {
    it('should return an instance of Profile', function (done) {
      var role = kuzzle.security.userFactory('test', {profile: ['myProfile']});
      should(role).instanceof(KuzzleUser);
      done();
    });

    it('should throw an error if no id is provided', function (done) {
      should((function () { kuzzle.security.userFactory(null) })).throw(Error);
      done();
    });
  });
});