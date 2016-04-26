export default angular.module('kuzzle.gauge', [])
  .directive('gauge', function () {
    'use strict';

    var gaugeConfiguration = function (label) {
      return {
        exporting: {
          enabled: false
        },
        chart: {
          type: 'gauge',
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },
        title: {
          text: label
        },
        pane: {
          startAngle: -150,
          endAngle: 150,
          background: [{
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#FFF'],
                [1, '#333']
              ]
            },
            borderWidth: 0,
            outerRadius: '109%'
          }, {
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#333'],
                [1, '#FFF']
              ]
            },
            borderWidth: 1,
            outerRadius: '107%'
          }, {
            // default background
          }, {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
          }]
        },
        // the value axis
        yAxis: {
          min: 0,
          max: 100,
          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickColor: '#666',
          tickPixelInterval: 30,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
            step: 2,
            rotation: 'auto'
          },
          plotBands: [{
            from: 0,
            to: 60,
            color: '#55BF3B' // green
          }, {
            from: 60,
            to: 80,
            color: '#DDDF0D' // yellow
          }, {
            from: 80,
            to: 100,
            color: '#DF5353' // red
          }]
        },
        series: [{
          name: label,
          data: [0],
          tooltip: {
            valueSuffix: ' %'
          }
        }],
        credits: {
          enabled: false
        }
      };
    };

    return {
      restrict: 'E',
      scope: {
        'label': '@',
        'value': '='
      },
      templateUrl: '/templates/common/gauge/gauge.tpl.html',
      replace: true,
      link: function (scope, element) {
        if (typeof scope.gauge === 'undefined') {
          angular.element(element).highcharts(gaugeConfiguration(scope.label),
            function (chart) {
              scope.gauge = chart;
            });
        }

        scope.$watch('value', function (value) {
          var point = scope.gauge.series[0].points[0];
          point.update(value);
        });
      }
    };
  })
  .name;
