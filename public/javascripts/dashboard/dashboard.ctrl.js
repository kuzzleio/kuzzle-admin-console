angular.module('kuzzle.dashboard')
  .controller('DashboardCtrl', [
    '$scope',
    'serverApi',
    '$timeout',
    function ($scope, serverApi, $timeout) {
      'use strict';

      $scope.Math = window.Math;
      $scope.timeFrame = 600 * 1000;
      $scope.widgets = [
        'serverInfo',
        'pluginInfo',
        'apiInfo',
        'statInfo'
      ];

      $scope.inArray = jQuery.inArray;
      $scope.grep = jQuery.grep;

      $scope.init = function () {
        if (
          $scope.inArray('serverInfo', $scope.widgets) !== -1 ||
          $scope.inArray('pluginInfo', $scope.widgets) !== -1 ||
          $scope.inArray('apiInfo', $scope.widgets) !== -1
        ) {
          serverApi.getServerInfo()
            .then(function (response) {
              $scope.serverInfo = response;
            });
        }
        if ($scope.inArray('statInfo', $scope.widgets) !== -1) {
          google.charts.load('current', {packages: ['corechart', 'line']});
          serverApi.getNowTimestamp()
            .then(function (response) {
              $scope.nowTimestamp = response;
              $scope.refreshStatistics();
            });
        }
      };

      $scope.closeWidget = function (widgetName) {
        $scope.widgets = $scope.grep($scope.widgets, function(value) {
          return value !== widgetName;
        });
      };

      $scope.refreshStatistics = function () {
        serverApi.getStatistics($scope.nowTimestamp - $scope.timeFrame)
          .then(function (response) {
            $scope.statistics = response;
            $scope.drawGraph();
            $scope.nowTimestamp = $scope.nowTimestamp + 10000;
            $timeout($scope.refreshStatistics, 10000);
          });
      };

      $scope.drawGraph = function () {
        google.charts.setOnLoadCallback(drawTrendlines);

        function drawTrendlines() {
          var data = new google.visualization.DataTable();
          var dataArray = [];
          var statisticProperties = ['x', 'connections', 'completedRequests', 'failedRequests', 'ongoingRequests'];
          var property = '';
          data.addColumn('number', 'X');
          data.addColumn('number', 'Connections');
          data.addColumn('number', 'Completed');
          data.addColumn('number', 'Failed');
          data.addColumn('number', 'Ongoing');
          data.addColumn({'type': 'string', 'role': 'tooltip'});

          for (var i = 0; i < $scope.statistics.length; i++) {
            dataArray[i] = [i*10, 0, 0, 0, 0, $scope.statistics[i].timestamp];
            for (var item = 1; item < statisticProperties.length; item++) {
              property = statisticProperties[item];
              if (
                $scope.statistics[i].hasOwnProperty(property)
              ) {
                for (var protocol in $scope.statistics[i][property]) {
                  if ($scope.statistics[i][property].hasOwnProperty(protocol) &&
                    $scope.statistics[i][property][protocol] !== null) {
                    dataArray[i][item] += $scope.statistics[i][property][protocol];
                  }
                }
              } else {
                dataArray[i][item] = 0;
              }
            }
          }

          data.addRows(dataArray);

          var options = {
            tooltip: {isHtml: true},
            hAxis: {
              title: 'Time (seconds)'
            },
            vAxis: {
              title: 'Number of requests'
            },
            colors: ['#00FF00', '#007329', '#AB0D06', '#0000FF']
          };

          var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
          chart.draw(data, options);
        }
      };
    }]);
