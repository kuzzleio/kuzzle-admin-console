angular.module('kuzzle.indexesApi', ['ui-notification', 'kuzzle.kuzzleSdk'])

  .service('indexesApi', [
    'kuzzleSdk',
    '$http',
    'uid',
    'Notification',
    '$q',
    function (kuzzleSdk, $http, uid, notification, $q) {
      return {
        list: function (notify) {
          var deferred = $q.defer();
          kuzzleSdk.listIndexes(function (error, indexes) {
            if (error) {
              if (notify) {
                notification.error('Error during indexes listing... Please reload page.');
              }

              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve(indexes);
          });

          return deferred.promise;
        },
        create: function (index, notify) {
        	var deferred = $q.defer();
        	kuzzleSdk.query({
            controller: 'admin',
            action: 'createIndex',
            index: index
          }, {}, {}, function (error, result) {
          	if (error) {
              if (notify) {
                notification.error('Error during index creation. Please retry.');
              }

          		return deferred.reject({error: true, message: error});
          	}

            if (notify) {
              notification.success('Index created !');
            }

          	return deferred.resolve(result);
           });
          return deferred.promise;
        },
        delete: function (index, notify) {
        	var deferred = $q.defer();
        	kuzzleSdk.query('', 'admin', 'deleteIndex', {
            controller: 'admin',
            action: 'deleteIndex',
            index: index
          }, function (error, result) {
          	if (error) {
              if (notify) {
                notification.error('Error during index deletion. Please retry.');
              }

          		return deferred.reject({error: true, message: error});
          	}

            if (notify) {
              notification.success('Index deleted !');
            }

          	return deferred.resolve(result);
        	});
        },
        select: function (index, notify) {
        	var deferred = $q.defer();
        	kuzzleSdk.setDefaultIndex(index);
          if (notify) {
            notification.success(index + ' selected !');
          }
        	deferred.resolve(index);
          return deferred.promise;
        }
      }
    }]);