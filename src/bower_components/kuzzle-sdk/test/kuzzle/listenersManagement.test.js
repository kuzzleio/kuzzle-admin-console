var
  should = require('should'),
  rewire = require('rewire'),
  Kuzzle = rewire('../../src/kuzzle');

describe('Listeners management', () => {
  var
    kuzzle,
    listenerIds;

  beforeEach(function () {
    var stublistener = function () {};

    kuzzle = new Kuzzle('foo', 'this is not an index');
    listenerIds = [];

    listenerIds.push(kuzzle.addListener('connected', stublistener));
    listenerIds.push(kuzzle.addListener('connected', stublistener));
    listenerIds.push(kuzzle.addListener('connected', stublistener));
    listenerIds.push(kuzzle.addListener('connected', stublistener));
    kuzzle.addListener('error', stublistener);
    kuzzle.addListener('error', stublistener);
    kuzzle.addListener('error', stublistener);
    kuzzle.addListener('disconnected', stublistener);
    kuzzle.addListener('disconnected', stublistener);
    kuzzle.addListener('reconnected', stublistener);
  });

  describe('#addListener', function () {
    it('should properly add new listeners to events', function () {
      should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(4);
      should(kuzzle.eventListeners['error'].listeners.length).be.exactly(3);
      should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(2);
      should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(1);
    });

    it('should throw an error if trying to adding a listener to an unknown event', function () {
      try {
        kuzzle.addListener('foo', function () {});
        should.fail('success', 'failure', 'Should have failed to add a listener to unknown event "foo"', '');
      }
      catch (e) { }
    });

    it('should throw an error when providing a non-function listener argument', function () {
      try {
        kuzzle.addListener('connected', 'bar');
        should.fail('success', 'failure', 'Should have failed to add a string listener', '');
      }
      catch (e) { }
    });
  });

  describe('#removeAllListeners', function () {
    it('should remove all registered listeners on a given event when asked to', function () {
      kuzzle.removeAllListeners('disconnected');

      should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(4);
      should(kuzzle.eventListeners['error'].listeners.length).be.exactly(3);
      should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(0);
      should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(1);
    });

    it('should remove all registered listeners on all events when providing no event argument', function () {
      kuzzle.removeAllListeners();

      should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(0);
      should(kuzzle.eventListeners['error'].listeners.length).be.exactly(0);
      should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(0);
      should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(0);
    });

    it('should throw an error when an unknown event is provided', function () {
      try {
        kuzzle.removeAllListeners('foo');
        should.fail('success', 'failure', 'Should have failed removing listeners with an unknown event', '');
      }
      catch (e) {
        should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(4);
        should(kuzzle.eventListeners['error'].listeners.length).be.exactly(3);
        should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(2);
        should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(1);
      }
    });
  });

  describe('#removeListener', function () {
    it('should remove any one listener from the listener list', function () {
      var listener = kuzzle.eventListeners.connected.listeners.filter(l => { return l.id === listenerIds[2]});

      should(listener.length).be.exactly(1);
      kuzzle.removeListener('connected', listenerIds[2]);
      listener = kuzzle.eventListeners.connected.listeners.filter(l => { return l.id === listenerIds[2]});
      should(listener.length).be.exactly(0);
      should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(3);
      should(kuzzle.eventListeners['error'].listeners.length).be.exactly(3);
      should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(2);
      should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(1);
    });

    it('should throw an error when trying to remove a listener from an unknown event', function () {
      try {
        kuzzle.removeListener('foo', 'bar');
        should.fail('success', 'failure', 'Should have failed removing listeners with an unknown event', '');
      }
      catch (e) {
        should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(4);
        should(kuzzle.eventListeners['error'].listeners.length).be.exactly(3);
        should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(2);
        should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(1);
      }
    });

    it('should do nothing if the provided listener id does not exist', function () {
      kuzzle.removeListener('connected', 'foo');
      should(kuzzle.eventListeners['connected'].listeners.length).be.exactly(4);
      should(kuzzle.eventListeners['error'].listeners.length).be.exactly(3);
      should(kuzzle.eventListeners['disconnected'].listeners.length).be.exactly(2);
      should(kuzzle.eventListeners['reconnected'].listeners.length).be.exactly(1);
    });
  });
});
