require('leaflet/dist/leaflet');

angular.module('schemaForm')

  .directive('sfLeaflet', ['leaflet', function (leaflet) {
    return {
      restrict: 'E',
      scope: {
        marker: '=',
        form: '=',
        multiple: '='
      },
      templateUrl: '/templates/data/storage/customFormDecorators/leaflet/sfLeaflet.tpl.html',
      link: function (scope) {
        var
          id = scope.form.title + '-' + (Math.random() * Date.now());

        scope.mapId = 'map-' + id;

        scope.$watch('marker', function () {
          getLatLngLabel();
        }, true);

        scope.onDrag = function (event) {
          scope.$apply(function () {
            scope.marker[scope.latLabel] = event.target._latlng.lat;
            scope.marker[scope.lngLabel] = event.target._latlng.lng;
          });
        };

        scope.onMapClick = function (event) {
          scope.marker[scope.latLabel] = event.latlng.lat;
          scope.marker[scope.lngLabel] = event.latlng.lng;
          scope.$apply();
        };

        var getLatLngLabel = function () {
          if (scope.form.schema.properties.lat) {
            scope.latLabel = 'lat';
          }
          else if (scope.form.schema.properties.latitude) {
            scope.latLabel = 'latitude';
          }

          if (scope.form.schema.properties.lon) {
            scope.lngLabel = 'lon';
          }
          else if (scope.form.schema.properties.lng) {
            scope.lngLabel = 'lng';
          }
          else if (scope.form.schema.properties.longitude) {
            scope.lngLabel = 'longitude';
          }
        };
      }
    };
  }])
  .run(['$templateCache', '$http', function($templateCache, $http) {
    $http.get('/templates/data/storage/customFormDecorators/leaflet/location.tpl.html', {cache: $templateCache});
  }])
  .config([
    'schemaFormProvider',
    'schemaFormDecoratorsProvider',
    'sfBuilderProvider',
    'sfPathProvider',
    function (schemaFormProvider, schemaFormDecoratorsProvider, sfBuilderProvider, sfPathProvider) {

      var location = function(name, schema, options) {
        if (schema.type === 'geo_point' && schema.properties && schema.properties.lat && schema.properties.lon && Object.keys(schema.properties).length === 2) {
          var f = schemaFormProvider.stdFormObj(name, schema, options);
          f.key = options.path;
          f.type = 'location';
          options.lookup[sfPathProvider.stringify(options.path)] = f;
          return f;
        }
      };

      /*eslint camelcase: ["error", {properties: "never"}]*/
      schemaFormProvider.defaults.geo_point = [];
      schemaFormProvider.defaults.geo_point.unshift(location);
      schemaFormDecoratorsProvider.addMapping(
        'bootstrapDecorator',
        'location',
        '/templates/data/storage/customFormDecorators/leaflet/location.tpl.html'
      );
    }]);
