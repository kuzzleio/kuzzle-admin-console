angular.module('kuzzle.indexesApi', ['ui-notification', 'kuzzle.kuzzleSdk'])
  .service('indexesApi', [
    'kuzzleSdk',
    '$q',
    '$state',
    'Notification',
    '$rootScope',
    function (kuzzleSdk, $q, $state, Notification, $rootScope) {

      var
        cache,
        service = this;

      service.data = {
        selectedIndex: null,
        indexes: null
      };

      /**
       * Manage internal index cache
       * @type {{set: cache.set, add: cache.add, remove: cache.remove}}
       */
      cache = {
        set: function(result) {
          service.data.indexes = result;
          return service.data.indexes;
        },
        add: function(index) {
          service.data.indexes.push(index);
        },
        remove: function(index) {
          service.data.indexes.splice(service.data.indexes.indexOf(index), 1);
        }
      };

      /**
       * Get existing indexes in kuzzle
       *
       * @returns {promise}
       */
      function getIndexes() {
        var deferred = $q.defer();

        kuzzleSdk.listIndexes(function (error, result) {
          if (error) {
            deferred.reject({
              error: true,
              message: error
            });
            return;
          }

          deferred.resolve(cache.set(result));
        });

        return deferred.promise;
      }

      /**
       * Return indexes' list (use cache if set)
       *
       * @returns {Promise}
       */
      service.list = function () {
        return (service.data.indexes) ? $q.when(service.data.indexes) : getIndexes();
      };

      /**
       * Return selected index
       *
       * @returns {*}
       */
      service.selectedIndex = function () {
        return service.data.selectedIndex;
      };

      /**
       *
       * @returns {promise}
       */
      service.isSelectedIndexValid = function(index, notify) {
        var deferred = $q.defer();

        service.list()
          .then(function(result) {
            var isIndexValid = (index && result.indexOf(index) !== -1);

            if (!isIndexValid && notify) {
              Notification.error('Index "' + index + '" does not exist');

              service.select();
              $rootScope.$broadcast('indexChanged');
            }

            deferred.resolve(isIndexValid);
          })
          .catch(function(error) {
            deferred.reject({
              error: true,
              message: error
            });
          });

        return deferred.promise;
      };

      /**
       * Create an index
       *
       * @param index
       * @returns {promise}
       */
      service.create = function (index) {
        var deferred = $q.defer();

        kuzzleSdk.query({
          controller: 'admin',
          action: 'createIndex',
          index: index
        }, {}, function (error, result) {
          if (error) {
            deferred.reject({
              error: true,
              message: error
            });
            return;
          }

          cache.add(index);

          deferred.resolve(result);
        });


        return deferred.promise;
      };

      /**
       * Delete an index
       *
       * @param index
       * @returns {promise}
       */
      service.delete = function (index) {
        var deferred = $q.defer();

        kuzzleSdk.query({
          controller: 'admin',
          action: 'deleteIndex',
          index: index
        }, {}, function (error, result) {
          if (error) {
            deferred.reject({
              error: true,
              message: error
            });
            return;
          }

          cache.remove(index);

          deferred.resolve(result);
        });

        return deferred.promise;
      };

      /**
       * Select current working index in kuzzle SDK
       *
       * @param index
       * @returns {service}
       */
      service.select = function (index) {
        if (index) {
          kuzzleSdk.setDefaultIndex(index);
        }

        service.data.selectedIndex = index;

        return this;
      };

      return service;
    }]);