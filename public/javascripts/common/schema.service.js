angular.module('kuzzle.schema', [])

  .service('schema', ['$http', '$q', function ($http, $q) {

    var buildPropertiesRecursive = function (mapping) {
      var
        properties = {},
        type;

      angular.forEach(mapping, function (value, attribute) {
        properties[attribute] = {};

        if (value.type) {
          type = value.type;

          if (value.type === 'long') {
            type = 'integer';
          }

          properties[attribute] = {
            type: type
          }
        }

        if (value.properties) {
          properties[attribute] = {
            type: 'object',
            title: attribute,
            properties: buildPropertiesRecursive(value.properties)
          }
        }
      });

      return properties;
    };


    return {
      get: function (collection) {
        return $http({
          url: '/schema/get',
          params: {collection: collection},
          method: 'GET'
        })
      },

      buildFormatter: function (collection) {
        var
          deferred = $q.defer(),
          mapping,
          schema = {};
        this.get(collection)
          .then(function (response) {
            if (response.data.error) {
              return deferred.reject(response.data.message);
            }

            mapping = response.data.mapping;

            schema = {
              title: collection,
              type: "object",
              properties: {}
            };

            schema.properties = buildPropertiesRecursive(mapping);
            schema.defaultProperties = Object.keys(schema.properties);

            deferred.resolve(schema);
          });

        return deferred.promise;
      }
    };
  }]);