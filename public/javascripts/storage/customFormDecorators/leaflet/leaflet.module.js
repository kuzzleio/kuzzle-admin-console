angular.module('schemaForm')

  .directive('sfLeaflet', [function () {
    return {
      restrict: 'E',
      scope: {
        ngModel: '=',
        form: '='
      },
      templateUrl: 'javascripts/storage/customFormDecorators/leaflet/sfLeaflet.tpl.html',
      link: function (scope) {

        scope.$watch('ngModel', function () {
          if (!scope.ngModel) {
            return false;
          }
          var id = scope.form + (Math.random() * Date.now());

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
            id: id,
            draggable: true
          };

          scope.$watch('marker', function () {
            scope.markers = [scope.marker];
            scope.ngModel[scope.latLabel] = scope.marker.lat;
            scope.ngModel[scope.lngLabel] = scope.marker.lng;
          }, true);
          scope.$on('leafletDirectiveMarker.location.dragend', function (event, marker) {
            if (marker.model && marker.model.id === id) {
              scope.marker.lat = marker.model.lat;
              scope.marker.lng = marker.model.lng;
            }
          });
        }, true);

      }
    }
  }])
  .config(function($logProvider){
    $logProvider.debugEnabled(false);
  })
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