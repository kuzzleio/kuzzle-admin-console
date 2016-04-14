require('./customFormDecorators/leaflet/sfLeaflet.module');

export default angular.module('kuzzle.leaflet', [])
  .service('leaflet', [function () {
    var
      maps = {};

    return {
      createMap: function (mapId, zoom) {
        maps[mapId] = {
          map: L.map(mapId).setView([51.505, -0.09], zoom),
          markers: []
        };

        L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(maps[mapId].map);
      },
      addEvent: function (mapId, event, cb) {
        maps[mapId].map.on(event, function (event) {
          cb({event: event});
        });
      },
      createMarker: function (mapId, object, options) {
        var
          latlng = object.latlng || object,
          marker;

        marker = L.marker(latlng, options).addTo(maps[mapId].map);
        maps[mapId].markers.push(marker);

        return marker;
      },
      setView: function (mapId, center, zoom) {
        maps[mapId].map.setView(center, zoom);
      },
      setZoom: function (mapId, zoom, options) {
        maps[mapId].map.setZoom(zoom, options);
      },
      setFitBounds: function (mapId, latLngBounds, options) {
        maps[mapId].map.fitBounds(latLngBounds, options);
      },
      setFitBoundsAuto: function (mapId, zoom) {
        var fitBounds = [];

        angular.forEach(maps[mapId].map._layers, function (marker) {
          if (!marker._latlng) {
            return false;
          }

          fitBounds.push(marker._latlng);
        });

        this.setFitBounds(mapId, fitBounds);
        this.setZoom(mapId, zoom || 5);
      },
      setMarkerLatLng: function (mapId, index, latLng, fit, zoom) {
        if (!maps[mapId] || !maps[mapId].markers || !maps[mapId].markers[index]) {
          return false;
        }

        maps[mapId].markers[index].setLatLng(latLng);

        if (fit) {
          this.setFitBoundsAuto(mapId, zoom);
        }
      },
      removeAllMarkers: function (mapId) {
        maps[mapId].markers.forEach(function (marker) {
          maps[mapId].map.removeLayer(marker);
        });
        maps[mapId].markers = [];
      }
    };
  }])

  .directive('leaflet', ['leaflet', function (leaflet) {
    return {
      restrict: 'E',
      scope: {
        mapId: '=',
        marker: '=',
        zoom: '=',
        onMapClick: '&',
        onDrag: '&',
        latLabel: '=',
        lngLabel: '='
      },
      template: '<div id="{{ mapId }}"></div>',
      link: function (scope) {
        var init = true;

        scope.$watch('mapId', function () {
          if (!scope.mapId) {
            return false;
          }

          leaflet.createMap(scope.mapId, scope.zoom || 13);
          leaflet.addEvent(scope.mapId, 'click', scope.onMapClick);

          scope.$watch('marker', function () {
            if (!scope.marker) {
              return false;
            }

            leaflet.removeAllMarkers(scope.mapId);
            addMarkers();
            init = false;
          }, true);

          scope.$watch('zoom', function () {
            if (!scope.zoom) {
              return false;
            }

            leaflet.setZoom(scope.mapId, scope.zoom);
          });
        }, true);

        var addMarkers = function () {
          var
            objectMarker,
            fitBounds = [];

          if (!scope.marker[scope.latLabel] || !scope.marker[scope.lngLabel]) {
            return false;
          }

          objectMarker = leaflet.createMarker(scope.mapId, scope.marker, {draggable: true});
          objectMarker.on('dragend', function (event) {
            scope.onDrag({event: event});
          });
          fitBounds.push(scope.marker);

          leaflet.setFitBounds(scope.mapId, fitBounds);
          if (scope.zoom) {
            leaflet.setZoom(scope.mapId, scope.zoom);
          }
        };
      }
    };
  }])
  .name;
