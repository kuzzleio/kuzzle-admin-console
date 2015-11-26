angular.module('schemaForm')

  .directive('sfLeaflet', ['leaflet', function (leaflet) {
    return {
      restrict: 'E',
      scope: {
        marker: '=',
        form: '=',
        multiple: '='
      },
      templateUrl: 'javascripts/storage/customFormDecorators/leaflet/sfLeaflet.tpl.html',
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
          scope.markers[scope.latLabel] = event.latlng.lat;
          scope.markers[scope.lngLabel] = event.latlng.lng;
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
    }
  }])
  .run(['$templateCache', '$http', function($templateCache, $http) {
    $http.get('javascripts/storage/customFormDecorators/leaflet/location.tpl.html', {cache: $templateCache});
  }])
  .config([
    'schemaFormProvider',
    'schemaFormDecoratorsProvider',
    'sfBuilderProvider',
    'sfPathProvider',
    function (schemaFormProvider, schemaFormDecoratorsProvider, sfBuilderProvider, sfPathProvider) {

      var location = function(name, schema, options) {
        if (schema.type === 'object' && schema.properties && schema.properties.lat && schema.properties.lon && Object.keys(schema.properties).length === 2) {
          var f = schemaFormProvider.stdFormObj(name, schema, options);
          f.key = options.path;
          f.type = 'location';
          options.lookup[sfPathProvider.stringify(options.path)] = f;
          return f;
        }
      };

      schemaFormProvider.defaults.object.unshift(location);
      schemaFormDecoratorsProvider.addMapping(
        'bootstrapDecorator',
        'location',
        'javascripts/storage/customFormDecorators/leaflet/location.tpl.html'
      );
    }]);