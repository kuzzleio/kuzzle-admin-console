var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle'),
  KuzzleRoom = rewire('../../src/kuzzleRoom');

describe('KuzzleRoom methods', function () {
  var
    expectedQuery,
    error,
    result,
    queryStub = function (args, query, options, cb) {
      if (!cb && typeof options === 'function') {
        cb = options;
        options = null;
      }

      emitted = true;
      should(args.index).be.exactly(expectedQuery.index);
      should(args.collection).be.exactly(expectedQuery.collection);
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
        should(Object.keys(query).length).be.exactly(0);
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
    },
    emitted,
    kuzzle,
    dataCollection;


  describe('#count', function () {
    var room;

    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {count: 42 }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'count',
        controller: 'subscribe',
        body: {}
      };
      room = new KuzzleRoom(dataCollection);
      room.roomId = 'foobar';
    });

    it('should send the right query to Kuzzle', function () {
      should(room.count(function () {})).be.exactly(room);
      should(emitted).be.true();
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { room.count();}).throw(Error);
      should(emitted).be.false();
    });

    it('should delay the request until after subscribing', function () {
      var cb = function () {};
      room.subscribing = true;
      should(room.count(cb)).be.exactly(room);
      should(emitted).be.false();
      should(room.queue).match([{action: 'count', args: [cb]}]);
    });

    it('should answer with the number of subscribers', function (done) {
      this.timeout(50);

      room.count(function (err, res) {
        should(err).be.null();
        should(res).be.a.Number().and.be.exactly(42);
        done();
      });
    });

    it('should resolve the callback with an error if one occurs', function (done) {
      this.timeout(50);
      error = 'foobar';

      room.count(function (err, res) {
        should(err).be.exactly('foobar');
        should(res).be.undefined();
        done();
      });
    });

    it('should fail if the room has no room ID', function () {
      room.roomId = undefined;
      should(function () {room.count(function () {})}).throw();
    });
  });

  describe('#renew', function () {
    var
      room,
      revert,
      dequeued;

    beforeEach(function () {
      dequeued = false;
      revert = KuzzleRoom.__set__('dequeue', function () { dequeued = true; });
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.state = 'connected';
      kuzzle.query = queryStub;
      dataCollection = kuzzle.dataCollectionFactory('foo');
      emitted = false;
      result = { result: {roomId: 'foobar', channel: 'barfoo' }};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'on',
        controller: 'subscribe',
        body: {}
      };
      room = new KuzzleRoom(dataCollection);
    });

    afterEach(function () {
      revert();
    });

    it('should send the right query to Kuzzle', function () {
      var
        before = Date.now();

      should(room.renew({}, function () {})).be.exactly(room);
      should(emitted).be.true();
      should(room.lastRenewal).be.within(before, Date.now());
    });

    it('should throw an error if no callback is provided', function () {
      should(function () { room.renew();}).throw(Error);
      should(emitted).be.false();
    });

    it('should handle arguments properly', function () {
      room.renew(function () {});
      should(emitted).be.true();
    });

    it('should delay the request until after subscribing', function () {
      var cb = function () {};
      room.subscribing = true;
      should(room.renew({}, cb)).be.exactly(room);
      should(emitted).be.false();
      should(room.queue).match([{action: 'renew', args: [{}, cb]}]);
    });

    it('should register itself in the global subscription list', function () {
      room.renew({}, function () {});
      should(kuzzle.subscriptions['foobar']).be.an.Object().and.not.be.empty();
      should(kuzzle.subscriptions['foobar'][room.id]).be.exactly(room);
    });

    it('should start dequeuing if subscribed successfully', function (done) {
      room.renew({}, function () {});

      setTimeout(() => {
        should(dequeued).be.true();
        done();
      }, 10);
    });

    it('should throw and empty the queue if the subscription fails', function () {
      error = 'foobar';
      room.queue.push({foo: 'bar'});
      should(function () { room.renew({}, function () {}); }).throw(Error);
      should(dequeued).be.false();
      should(room.lastRenewal).be.null();
      should(room.queue).be.empty();
    });

    it('should register itself to Kuzzle and skip subscription if not connected', function (done) {
      kuzzle.state = 'foo';
      should(room.renew({}, function () {})).be.eql(room);
      setTimeout(() => {
        should(dequeued).be.false();
        should(emitted).be.false();
        should(room.lastRenewal).be.null();
        should(kuzzle.subscriptions.pending[room.id]).be.eql(room);
        done();
      }, 10);
    });

    it('should not renew subscription if another renewal was performed before the allowed delay', function (done) {
      var
        renewals = 0,
        before = Date.now(),
        after;

      kuzzle.query = function () { renewals++; arguments[3](null, result); };
      room.renew({}, function () {});
      after = Date.now();
      room.renew({}, function () {});
      room.renew({}, function () {});

      setTimeout(() => {
        should(renewals).be.eql(1);
        should(room.lastRenewal).be.within(before, after);
        done();
      }, 20);
    });
  });

  describe('#setHeaders', function () {
    var room;

    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
      room = new KuzzleRoom(dataCollection);
    });

    it('should set headers properly', function () {
      should(room.setHeaders({foo: 'bar'})).be.exactly(room);
      should(room.headers).match({foo: 'bar'});
    });
  });

  describe('#unsubscribe', function () {
    var
      room,
      socketOff;

    beforeEach(function () {
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      kuzzle.query = queryStub;
      kuzzle.socket = {
        off: function () { socketOff = true; }
      };

      socketOff = true;
      emitted = false;
      result = { result: {}};
      error = null;
      expectedQuery = {
        index: 'bar',
        collection: 'foo',
        action: 'off',
        controller: 'subscribe',
        body: {}
      };

      dataCollection = kuzzle.dataCollectionFactory('foo');
      room = new KuzzleRoom(dataCollection);
      room.roomId = 'foobar';
      kuzzle.subscriptions['foobar'] = {};
      kuzzle.subscriptions['foobar'][room.id] = room;
    });

    it('should stop listening to the socket room once subscription has stopped', function () {
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(emitted).be.true();
      should(kuzzle.subscriptions['foobar']).be.undefined();
    });

    it('should not emit an unsubscribe request if another KuzzleRoom is listening to that room', function () {
      kuzzle.subscriptions['foobar']['foo'] = {};
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(emitted).be.false();
      should(kuzzle.subscriptions['foobar']).not.be.empty();
      should(Object.keys(kuzzle.subscriptions['foobar']).length).be.exactly(1);
      should(kuzzle.subscriptions['foobar']['foo']).not.be.undefined();
    });

    it('should unsubscribe only after all pending subscriptions are finished', function (done) {
      kuzzle.subscriptions.pending.foo = {};
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(emitted).be.false();
      should(kuzzle.subscriptions['foobar']).be.undefined();
      kuzzle.subscriptions.pending = {};
      setTimeout(() => {
        should(emitted).be.true();
        done();
      }, 100);
    });

    it('should not unsubscribe if pending actions were subscriptions on that room', function (done) {
      kuzzle.subscriptions.pending.foo = {};
      should(room.unsubscribe()).be.exactly(room);
      should(socketOff).be.true();
      should(emitted).be.false();
      should(kuzzle.subscriptions['foobar']).be.undefined();
      kuzzle.subscriptions.pending = {};
      kuzzle.subscriptions.foobar = {};
      kuzzle.subscriptions.foobar.foo = {};
      setTimeout(() => {
        should(emitted).be.false();
        done();
      }, 100);
    });

    it('should delay the unsubscription until after the current subscription is done', function () {
      room.subscribing = true;
      should(room.unsubscribe()).be.exactly(room);
      should(room.queue).match([{action: 'unsubscribe', args: []}]);
    });
  });

  describe('#dequeue', function () {
    var
      dequeue = KuzzleRoom.__get__('dequeue'),
      room,
      dequeued;

    beforeEach(function () {
      var stub = function () { dequeued++; };

      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
      room = new KuzzleRoom(dataCollection);
      room.count = stub;
      room.renew = stub;
      room.unsubscribe = stub;
    });

    it('should replay requests queued while refreshing', function () {
      dequeued = 0;

      dequeue.call(room);
      should(dequeued).be.exactly(0);

      room.queue.push({action: 'count', args: []});
      room.queue.push({action: 'renew', args: []});
      room.queue.push({action: 'unsubscribe', args: []});
      dequeue.call(room);
      should(dequeued).be.exactly(3);
    });
  });

  describe('#notificationCallback', function () {
    var
      notifCB = KuzzleRoom.__get__('notificationCallback'),
      room,
      called,
      error,
      result;

    beforeEach(function () {
      called = false;
      error = result = undefined;
      kuzzle = new Kuzzle('foo', {defaultIndex: 'bar'});
      dataCollection = kuzzle.dataCollectionFactory('foo');
      room = new KuzzleRoom(dataCollection);
      room.callback = function (err, res) { called = true; error = err; result = res; };
    });

    it('should call back with an error if query returns an error', function () {
      notifCB.call(room, {error: 'foobar', result: {}});
      should(result).be.undefined();
      should(error).be.exactly('foobar');
    });

    it('should return the result when one is provided', function () {
      var msg = {error: null, result: {foo: 'bar'}};
      notifCB.call(room, msg);
      should(result).match(msg);
      should(error).be.null();
    });

    it('should delete the result from history if emitted by this instance', function () {
      room.subscribeToSelf = true;
      kuzzle.requestHistory['bar'] = {};
      notifCB.call(room, {error: null, result: {}, action: 'foo', requestId: 'bar'});
      should(called).be.true();
      should(kuzzle.requestHistory).be.empty();
    });

    it('should not forward the message if subscribeToSelf is false and the response comes from a query emitted by this instance', function () {
      room.subscribeToSelf = false;
      kuzzle.requestHistory['bar'] = {};
      notifCB.call(room, {error: null, result: {}, requestId: 'bar', action: 'foo'});
      should(called).be.false();
      should(kuzzle.requestHistory).be.empty();
    });

    it('should fire a "jwtTokenExpired" event when receiving a jwtTokenExpired notification', function () {
      var
        eventEmitted = null,
        context = {
          kuzzle: {
            emitEvent: event => eventEmitted = event
          }
        };

      notifCB.call(context, {error: null, result: {}, action: 'jwtTokenExpired'});
      should(eventEmitted).be.eql('jwtTokenExpired');
    });
  });
});
