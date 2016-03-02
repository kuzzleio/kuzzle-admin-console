var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle');

describe('Kuzzle.getStatistics', function () {
  var
    kuzzle,
    passedOptions,
    error,
    result,
    queryStub = function (collection, controller, action, query, options, cb) {
      emitted = true;
      should(collection).be.null();
      should(controller).be.exactly('admin');
      should(action).be.exactly('getAllStats');
      should(Object.keys(query).length).be.exactly(0);

      if (passedOptions) {
        should(options).match(passedOptions);
      }

      cb(error, result);
    },
    emitted,
    controller;

  beforeEach(function () {
    kuzzle = new Kuzzle('foo', 'this is not an index');
    emitted = false;
  });

  it('should throw an error if no callback is provided', function () {
    should(function () { kuzzle.getStatistics(); }).throw(Error);
    should(emitted).be.false();
    should(function () { kuzzle.getStatistics(132); }).throw(Error);
    should(emitted).be.false();
    should(function () { kuzzle.getStatistics({}); }).throw(Error);
    should(emitted).be.false();
    should(function () { kuzzle.getStatistics(456, {}); }).throw(Error);
    should(emitted).be.false();
  });


});