var
  should = require('should'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleRole = require('../../../src/security/kuzzleRole');

describe('KuzzleSecurity roles methods', function () {
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

  describe('#getRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _source: {} }};
      expectedQuery = {
        action: 'getRole',
        controller: 'security',
        _id: 'foobar'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      should(kuzzle.security.getRole(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      should(function () { kuzzle.security.getRole('test'); }).throw(Error);
    });

    it('should throw an error when no id is provided', function () {
      should(function () { kuzzle.security.getRole(null, function () {}); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'error';
      this.timeout(50);

      kuzzle.security.getRole('foobar', function (err, res) {
        should(err).be.exactly('error');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#searchRoles', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: { total: 123, hits: [ {_id: 'myRole', _source: {indexes : {}}} ]}};
      expectedQuery = {
        action: 'searchRoles',
        controller: 'security'
      };
    });

    it('should send the right search query to kuzzle', function (done) {
      var
        filters = { indexes: ['test'] };

      this.timeout(50);
      expectedQuery.body = filters;

      should(kuzzle.security.searchRoles(filters, function (err, res) {
        should(err).be.null();
        should(res).be.an.Object();
        should(res.total).be.a.Number().and.be.exactly(result.result.total);
        should(res.roles).be.an.Array();
        should(res.roles).not.be.empty();
        should(res.roles.length).be.exactly(result.result.hits.length);

        res.roles.forEach(function (item) {
          should(item).be.instanceof(KuzzleRole);
        });

        done();
      }));
    });

    it('should raise an error if no callback is provided', function () {
      var
        filters = { indexes: ['test'] };

      should(function () { kuzzle.security.searchRoles(filters); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      var
        filters = { indexes: ['test'] };

      expectedQuery.body = filters;

      error = 'foobar';
      this.timeout(50);

      kuzzle.security.searchRoles(filters, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });


  describe('#createRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'myRole', _source: {indexes : {}}} };
      expectedQuery = {
        action: 'createRole',
        controller: 'security'
      };
    });

    it('should send the right createRole query to Kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzle.security.createRole(result.result._id, result.result._source, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should send the right createRole query to Kuzzle even without callback', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      kuzzle.security.createRole(result.result._id, result.result._source);
      done();
    });

    it('should construct a createOrReplaceRole action if option replaceIfExist is set to true', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createOrReplaceRole';

      should(kuzzle.security.createRole(result.result._id, result.result._source, {replaceIfExist: true}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should construct a createRole action if option replaceIfExist is set to false', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;
      expectedQuery.action = 'createRole';

      should(kuzzle.security.createRole(result.result._id, result.result._source, {replaceIfExist: false}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.createRole(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.createRole(result.result._id, result.result._source, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#updateRole', function () {
    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      error = null;
      result = { result: {_id: 'foobar', _index: '%kuzzle', _type: 'roles'} };
      expectedQuery = {
        action: 'updateRole',
        controller: 'security'
      };
    });

    it('should send the right query to Kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzle.security.updateRole(result.result._id, {'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should send the right query to Kuzzle even without callback', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      kuzzle.security.updateRole(result.result._id, {'foo': 'bar'});
      done();
    });

    it('should throw an error if no id provided', function () {
      should(function () { kuzzle.security.updateRole(null); }).throw(Error);
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.updateRole(result.result._id, {'foo': 'bar'}, function (err, res) {
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
      result = { result: {_id: 'myRole'} };
      expectedQuery = {
        action: 'deleteRole',
        controller: 'security',
        _id: result.result._id
      };
    });

    it('should send the right delete query to Kuzzle', function (done) {
      should(kuzzle.security.deleteRole(result.result._id, function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should send the right delete query to Kuzzle even without callback', function (done) {
      kuzzle.security.deleteRole(result.result._id);
      done();
    });

    it('should call the callback with an error if one occurs', function (done) {
      error = 'foobar';
      this.timeout(50);

      kuzzle.security.deleteRole(result.result._id, function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });

  describe('#roleFactory', function () {
    it('should return an instance of Role', function (done) {
      var role = kuzzle.security.roleFactory('test', {index: {}});
      should(role).instanceof(KuzzleRole);
      done();
    });

    it('should throw an error if no id is provided', function (done) {
      should((function () { kuzzle.security.roleFactory(null) })).throw(Error);
      done();
    });
  });
});