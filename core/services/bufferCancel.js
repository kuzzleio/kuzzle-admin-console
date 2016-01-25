var
  buffer = {},
  excludeId = [];

module.exports = {
  timer: 5000,
  add: function (fn, clientId, index, collection, id, exclude) {
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
      }, self.timer);
    }

    // By default, we add an entry but the function (fn) is not already canceled by the user
    buffer[fn][clientId][index + '-' + collection + '-' + id] = false;
  },
  cancel: function (fn, clientId, index, collection, id) {
    if (!buffer[fn]) {
      return false;
    }

    if (!buffer[fn][clientId]) {
      return false;
    }

    this.removeIdExcluded(id);
    buffer[fn][clientId][index + '-' + collection + '-' + id] = true;
  },
  clean: function (fn, clientId, index, collection, id) {
    if (!buffer[fn]) {
      return false;
    }

    if (!buffer[fn][clientId]) {
      return false;
    }

    if (buffer[fn][clientId][index + '-' + collection + '-' + id] === undefined) {
      return false;
    }

    this.removeIdExcluded(id);

    delete buffer[fn][clientId][index + '-' + collection + '-' + id];
  },
  isCanceled: function (fn, clientId, index, collection, id) {
    if (!buffer[fn]) {
      return false;
    }

    if (!buffer[fn][clientId]) {
      return false;
    }

    if (buffer[fn][clientId][index + '-' + collection + '-' + id]) {
      return true;
    }
  },
  delayExecution: function (fn, clientId, index, collection, id, cb) {
    var self = this;

    setTimeout(function () {
      if (self.isCanceled(fn, clientId, index, collection, id)) {
        self.clean(fn, clientId, index, collection, id);
        return false;
      }

      cb();
      self.clean(fn, clientId, index, collection, id);

    }, self.timer);
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