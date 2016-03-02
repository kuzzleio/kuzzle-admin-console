var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  Kuzzle = require('../../../src/kuzzle'),
  KuzzleRole = require('../../../src/security/kuzzleRole');

describe('KuzzleRole methods', function () {
  var
    kuzzle,
    kuzzleRole,
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
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'myRole', _source: {indexes : {}}} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'createOrReplaceRole',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleRole.save(function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      kuzzleRole.save(function (err, res) {
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

      result = { result: {_id: 'myRole', _index: '%kuzzle', _type: 'roles'} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, {indexes : {}});
      expectedQuery = {
        action: 'updateRole',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      should(kuzzleRole.update({'foo': 'bar'}, function (err, res) {
        should(err).be.null();
        should(res).be.instanceof(KuzzleRole);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = {'foo': 'bar'};
      expectedQuery._id = result.result._id;

      error = 'foobar';
      this.timeout(50);

      kuzzleRole.update({'foo': 'bar'}, function (err, res) {
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
        kuzzleRole.update();
      }
      catch(error) {
        should(error).be.instanceOf(Error);
        done();
      }
    });
  });

  describe('#delete', function () {
    before(function () {
      kuzzle = new Kuzzle('http://localhost:7512');
      kuzzle.query = queryStub;
      error = false;

      result = { result: {_id: 'myRole'} };
      kuzzleRole = new KuzzleRole(kuzzle.security, result.result._id, result.result._source);
      expectedQuery = {
        action: 'deleteRole',
        controller: 'security'
      };
    });

    it('should send the right query to kuzzle', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      should(kuzzleRole.delete(function (err, res) {
        should(err).be.null();
        should(res).be.exactly(result.result._id);
        done();
      }));
    });

    it('should call the callback with an error if one occurs', function (done) {
      expectedQuery.body = result.result._source;
      expectedQuery._id = result.result._id;

      error = 'foobar';

      kuzzleRole.delete(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });
  });
});
