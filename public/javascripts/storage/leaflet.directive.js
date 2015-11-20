angular.module('kuzzle.leaflet', [])

  .service('leaflet', [function () {
    var maps = {};

    return {
      createMap: function (mapId, zoom) {
        maps[mapId] = L.map(mapId).setView([51.505, -0.09], zoom);

        L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYXNlbmRyYSIsImEiOiJjaWg3anRiYnAwMDFjdjVtMzgzNzZmOGU3In0.uY7SRGbkqccZY0TDHlm32w', {
          attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>'
        }).addTo(maps[mapId]);
      },
      addEvent: function (mapId, event, cb) {
        maps[mapId].on(event, function (event) {
          cb({event: event});
        });
      },
      createMarker: function (mapId, object, options) {
        var latlng = object.latlng || object;

        return L.marker(latlng, options).addTo(maps[mapId]);
      },
      setView: function (mapId, center, zoom) {
        maps[mapId].setView(center, zoom);
      },
      setZoom: function (mapId, zoom, options) {
        maps[mapId].setZoom(zoom, options);
      },
      setFitBounds: function (mapId, latLngBounds, options) {
        maps[mapId].fitBounds(latLngBounds, options);
      }
    }
  }])

  .directive('leaflet', ['leaflet', function (leaflet) {
    return {
      restrict: 'E',
      scope: {
        mapId: '=',
        markers: '=',
        zoom: '=',
        onMapClick: '&',
        onDrag: '&'
      },
      template: '<div id="{{ mapId }}"></div>',
      link: function (scope) {
        var
          fitBounds = [],
          objectMarkers = {};

        scope.$watch('mapId', function () {
          if (!scope.mapId) {
            return false;
          }

          leaflet.createMap(scope.mapId, scope.zoom || 13);
          leaflet.addEvent(scope.mapId, 'click', scope.onMapClick);

          scope.$watch('markers', function (newVal, oldVal) {
            if (!scope.markers || scope.markers.length === 0) {
              return false;
            }

            if (oldVal) {
              scope.markers.forEach(function (marker) {
                objectMarkers[marker.id].setLatLng([marker.lat, marker.lng]);
              });
              return false;
            }

            initMarkers();
          });

          scope.$watch('zoom', function () {
            if (!scope.zoom) {
              return false;
            }

            leaflet.setZoom(scope.mapId, scope.zoom);
          });
        }, true);

        var initMarkers = function () {
          var objectMarker;

          scope.markers.forEach(function (marker) {

            objectMarker = leaflet.createMarker(scope.mapId, marker, {draggable: marker.draggable});
            objectMarker.on('dragend', function (event) {
              scope.onDrag({event: event, markerId: marker.id});
            });
            fitBounds.push(marker);

            objectMarkers[marker.id] = objectMarker;
          });

          leaflet.setFitBounds(scope.mapId, fitBounds);
          if (scope.zoom) {
            leaflet.setZoom(scope.mapId, scope.zoom);
          }
        }
      }
    }
  }]);