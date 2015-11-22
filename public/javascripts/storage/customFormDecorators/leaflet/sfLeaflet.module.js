angular.module('schemaForm')

  .directive('sfLeaflet', ['leaflet', function (leaflet) {
    return {
      restrict: 'E',
      scope: {
        markers: '=',
        marker: '=',
        form: '=',
        multiple: '='
      },
      templateUrl: 'javascripts/storage/customFormDecorators/leaflet/sfLeaflet.tpl.html',
      link: function (scope) {
        var
          id = scope.form.title + '-' + (Math.random() * Date.now()),
          index;

        scope.mapId = 'map-' + id;
        scope.newMarker = {
          draggable: true
        };

        scope.$watch('marker', function () {
          getLatLngLabel();

          if (!scope.markers) {
            scope.markers = [];
          }
          if (scope.markers.length === 0 && scope.marker) {
            scope.marker.id = 0;
            scope.marker.draggable = true;
            scope.markers.push(scope.marker);
          }
        }, true);

        scope.onDrag = function (event, index) {
          scope.$apply(function () {
            scope.markers[index][scope.latLabel] = event.target._latlng.lat;
            scope.markers[index][scope.lngLabel] = event.target._latlng.lng;
          });
        };

        scope.changeLatLng = function (index) {
          if (index === undefined) {
            if (scope.newMarker[scope.latLabel] && scope.newMarker[scope.lngLabel]) {
              index = scope.markers.length;
              scope.newMarker.id = index;
              scope.markers.push(scope.newMarker);

              // reset newMarker values
              scope.newMarker = {draggable: true};
            }
          }
        };

        scope.onMapClick = function (event) {
          if (!scope.multiple) {
            index = 0;
            leaflet.removeAllMarkers(scope.mapId);
          }
          else {
            index = scope.markers.length;
          }

          scope.markers[index] = {id: index};
          scope.markers[index][scope.latLabel] = event.latlng.lat;
          scope.markers[index][scope.lngLabel] = event.latlng.lng;
          scope.markers[index].draggable = true;

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
        if (schema.type === 'location' || (schema.type === 'object' && schema.format === 'location')) {
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