angular.module('kuzzle.chart', [])
  .directive('chart', function () {
    'use strict';

    var chartConfiguration = function (ylabel, series) {
      return {
        credits: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        title: {
          enabled: false
        },
        subtitle: {
          enabled: false
        },
        chart: {
          type: 'line'
        },
        yAxis: {
          title: {
            text: ylabel
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        tooltip: {
          valueSuffix: '',
          shared: true
        },
        legend: {
          align: 'center',
          verticalAlign: 'bottom',
          enabled: true
        },
        rangeSelector: {
          buttons: [{
            count: 5,
            type: 'minute',
            text: '5min'
          }, {
            count: 30,
            type: 'minute',
            text: '30min'
          }, {
            count: 1,
            type: 'hour',
            text: '1h'
          }, {
            type: 'all',
            text: 'All'
          }],
          inputEnabled: false,
          selected: 2
        },
        series: series
      };
    };

    return {
      restrict: 'E',
      scope: {
        'ylabel': '@',
        'series': '=',
        'newvalue': '='
      },
      templateUrl: '/javascripts/common/chart/chart.tpl.html',
      replace: true,
      link: function (scope, element) {
        scope.$watch('series', function (series) {
          if (typeof scope.chart === 'undefined' && series.length > 0) {
            angular.element(element).highcharts('StockChart', chartConfiguration(scope.ylabel, scope.series),
              function (chart) {
                scope.chart = chart;
              });
          }
        });

        scope.$watch('newvalue', function (newValue) {
          if (typeof scope.chart !== 'undefined' && newValue.length) {
            for (var i = 0; i < newValue.length; i++) {
              scope.chart.series[i].addPoint(newValue[i].data[0]);
            }
          }
        });
      }
    };
  });
