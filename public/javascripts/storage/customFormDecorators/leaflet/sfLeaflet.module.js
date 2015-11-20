angular.module('schemaForm')

  .directive('sfLeaflet', ['leaflet', function (leaflet) {
    return {
      restrict: 'E',
      scope: {
        ngModel: '=',
        form: '='
      },
      templateUrl: 'javascripts/storage/customFormDecorators/leaflet/sfLeaflet.tpl.html',
      link: function (scope) {
        var
          id = scope.form.title + '-' + (Math.random() * Date.now()),
          markerId = 'marker-' + id,
          marker;

        scope.mapId = 'map-' + id;

        scope.$watch('ngModel', function () {
          if (!scope.ngModel) {
            return false;
          }

          if (scope.ngModel['lat']) {
            scope.latLabel = 'lat';
          }
          if (scope.ngModel['latitude']) {
            scope.latLabel = 'latitude';
          }

          if (scope.ngModel['lon']) {
            scope.lngLabel = 'lon';
          }
          if (scope.ngModel['lng']) {
            scope.lngLabel = 'lng';
          }
          if (scope.ngModel['longitude']) {
            scope.lngLabel = 'longitude';
          }

          scope.marker = {
            lat: scope.ngModel[scope.latLabel],
            lng: scope.ngModel[scope.lngLabel],
            draggable: true,
            id: markerId
          };

          scope.$watch('marker', function () {
            scope.markers = [scope.marker];
            scope.ngModel[scope.latLabel] = scope.marker.lat;
            scope.ngModel[scope.lngLabel] = scope.marker.lng;
          }, true);
        }, true);

        scope.onMapClick = function (event) {
          if (!scope.marker) {
            marker = leaflet.createMarker(scope.mapId, event, {draggable: true});
            marker.on('dragend', scope.onDrag);
            scope.$apply(function () {
              scope.marker = {
                lat: event.latlng.lat,
                lng: event.latlng.lng
              };
            });
          }
        };

        scope.onDrag = function (event) {
          scope.$apply(function () {
            scope.marker.lat = event.target._latlng.lat;
            scope.marker.lng = event.target._latlng.lng;
          });
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