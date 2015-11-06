var
  buffer = {},
  excludeId = [],
  timer = 4000;

module.exports = {
  add: function (fn, clientId, collection, id, exclude) {
    var self = this;

    if (!buffer[fn]) {
      buffer[fn] = {};
    }

    if (!buffer[fn][clientId]) {
      buffer[fn][clientId] = {};
    }

    if (exclude) {
      excludeId.push(id);
      setTimeout(function () {
        self.removeIdExcluded(id);
      }, timer);
    }

    // By default, we add an entry but the function (fn) is not already canceled by the user
    buffer[fn][clientId][collection + '-' + id] = false;
  },
  cancel: function (fn, clientId, collection, id) {
    if (!buffer[fn]) {
      return false;
    }

    if (!buffer[fn][clientId]) {
      return false;
    }

    buffer[fn][clientId][collection + '-' + id] = true;
  },
  clean: function (fn, clientId, collection, id) {
    if (!buffer[fn]) {
      return false;
    }

    if (!buffer[fn][clientId]) {
      return false;
    }

    if (buffer[fn][clientId][collection + '-' + id] === undefined) {
      return false;
    }

    this.removeIdExcluded(id);

    delete buffer[fn][clientId][collection + '-' + id];
  },
  isCanceled: function (fn, clientId, collection, id) {
    if (!buffer[fn]) {
      return false;
    }

    if (!buffer[fn][clientId]) {
      return false;
    }

    if (buffer[fn][clientId][collection + '-' + id]) {
      return true;
    }
  },
  delayExecution: function (fn, clientId, collection, id, cb) {
    var self = this;

    setTimeout(function () {
      if (self.isCanceled(fn, clientId, collection, id)) {
        self.clean(fn, clientId, collection, id);
        return false;
      }

      self.clean(fn, clientId, collection, id);
      cb();

    }, timer);
  },
  getExcludedIds: function () {
    return excludeId;
  },
  removeIdExcluded: function (id) {
    var index = excludeId.indexOf(id);

    if (index === -1) {
      return false;
    }

    excludeId.splice(index, 1);
  }
};