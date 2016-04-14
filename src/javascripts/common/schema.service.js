export default angular.module('kuzzle.schema', ['kuzzle.kuzzleSdk'])
  .service('schema', ['kuzzleSdk', '$q', function (kuzzleSdk, $q) {

    var buildPropertiesRecursive = function (mapping) {
      var
        properties = {},
        type;

      angular.forEach(mapping, function (value, attribute) {
        properties[attribute] = {};
        if (value.type) {
          type = value.type;

          if (value.type === 'long' || value.type === 'double') {
            type = 'number';
          }

          properties[attribute] = {
            type: type
          };
        }

        if (value.properties) {
          properties[attribute] = {
            type: 'object',
            title: attribute,
            properties: buildPropertiesRecursive(value.properties)
          };
        }
      });

      return properties;
    };


    return {
      get: function (collection) {
        var deferred = $q.defer();

        kuzzleSdk
          .dataCollectionFactory(collection)
          .getMapping(function (error, result) {
            if (error) {
              return deferred.reject({error: true, message: error});
            }

            return deferred.resolve({mapping: result.mapping});
          });

        return deferred.promise;
      },

      buildFormatter: function (collection) {
        var
          deferred = $q.defer(),
          mapping,
          schema = {};

        this.get(collection)
          .then(function (response) {
            mapping = response.mapping;

            schema = {
              title: collection,
              type: 'object',
              properties: {},
              disableSuccessState: true
            };

            schema.properties = buildPropertiesRecursive(mapping);

            deferred.resolve(schema);
          })
          .catch(function (error) {
            return deferred.reject(error);
          });

        return deferred.promise;
      }
    };
  }])
  .name;
