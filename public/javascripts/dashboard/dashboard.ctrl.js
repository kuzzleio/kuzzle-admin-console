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
        'statInfo',
        'resourceInfo'
      ];

      $scope.init = function () {
        if (isOneWidgetSelected(['statInfo', 'resourceInfo']) && typeof google.visualization === 'undefined') {
          google.charts.load('current', {packages: ['corechart', 'line', 'gauge']});
        }
        if ($scope.isWidgetSelected('statInfo')) {
          serverApi.getNowTimestamp()
            .then(function (response) {
              $scope.nowTimestamp = response;
              $scope.refreshStatistics();
            });
        }
        if (isOneWidgetSelected(['serverInfo', 'pluginInfo', 'apiInfo', 'resourceInfo'])) {
          $scope.refreshServerInfo();
        }
      };

      $scope.refreshServerInfo = function () {
        serverApi.getServerInfo()
          .then(function (response) {
            if (typeof $scope.serverInfo !== 'undefined') {
              $scope.previousServerInfo = $scope.serverInfo;
            }
            $scope.serverInfo = response;
            drawGraph();
            $timeout($scope.refreshServerInfo, 2000);
          });
      };

      $scope.refreshStatistics = function (userAction) {
        if (typeof userAction === 'undefined') {
          userAction = false;
        }
        serverApi.getStatistics($scope.nowTimestamp - $scope.timeFrame)
          .then(function (response) {
            $scope.statistics = response;
            drawGraph();
            serverApi.getNowTimestamp()
              .then(function (response) {
                $scope.nowTimestamp = response;
                if (!userAction) {
                  $timeout($scope.refreshStatistics, 2000);
                }
              });
          });
      };

      $scope.isWidgetSelected = function (widgetName) {
        return inArray(widgetName, $scope.widgets) !== -1;
      };

      $scope.reloadWidgets = function () {
        $scope.widgets = [
          'serverInfo',
          'pluginInfo',
          'apiInfo',
          'statInfo',
          'resourceInfo'
        ];
      };

      /** PRIVATE METHODS **/

      var inArray = jQuery.inArray;
      var grep = jQuery.grep;

      var flattenStatistics = function (statistics) {
        var dataArray = [];
        var statisticProperties = ['x', 'connections', 'completedRequests', 'failedRequests', 'ongoingRequests'];
        var property = '';


        for (var i = 0; i < statistics.length; i++) {
          dataArray[i] = [i * 10, 0, 0, 0, 0];
          for (var item = 1; item < statisticProperties.length; item++) {
            property = statisticProperties[item];
            if (
              statistics[i].hasOwnProperty(property)
            ) {
              for (var protocol in statistics[i][property]) {
                if (statistics[i][property].hasOwnProperty(protocol) &&
                  statistics[i][property][protocol] !== null) {
                  dataArray[i][item] += statistics[i][property][protocol];
                }
              }
            } else {
              dataArray[i][item] = 0;
            }
          }
        }
        return dataArray;
      };

      var drawTrendlines = function () {
        if ($scope.isWidgetSelected('statInfo') && typeof $scope.statistics !== 'undefined') {
          var statisticData = new google.visualization.DataTable();
          statisticData.addColumn('number', 'X');
          statisticData.addColumn('number', 'Connections');
          statisticData.addColumn('number', 'Completed');
          statisticData.addColumn('number', 'Failed');
          statisticData.addColumn('number', 'Ongoing');

          statisticData.addRows(flattenStatistics($scope.statistics));

          var statisticOptions = {
            tooltip: {isHtml: true},
            hAxis: {
              title: 'Time (seconds)'
            },
            vAxis: {
              title: 'Number of requests'
            },
            colors: ['#00FF00', '#007329', '#AB0D06', '#0000FF']
          };

          var statisticChart = new google.visualization.LineChart(document.getElementById('statistics_graph'));
          statisticChart.draw(statisticData, statisticOptions);
        }
        if ($scope.isWidgetSelected('resourceInfo') && typeof $scope.serverInfo !== 'undefined') {
          var memory = computeMemoryUsePercent();
          var cpu = computeCpuUsePercent();
          var resourceData = google.visualization.arrayToDataTable([
            ['Label', 'Value'],
            ['Memory', memory],
            ['CPU', cpu]
          ]);

          var resourceOptions = {
            width: 400, height: 250,
            redFrom: 90, redTo: 100,
            yellowFrom: 75, yellowTo: 90,
            minorTicks: 5
          };

          var resourceChart = new google.visualization.Gauge(document.getElementById('resources_gauge'));

          resourceChart.draw(resourceData, resourceOptions);
        }
      };

      var computeMemoryUsePercent = function () {
        return $scope.Math.round(
            $scope.serverInfo.kuzzle.memoryUsed * 100 * 10 /
            ($scope.serverInfo.kuzzle.memoryUsed + $scope.serverInfo.kuzzle.system.memory.free)
          ) / 10;
      };

      var computeCpuUsePercent = function () {
        if (typeof $scope.previousServerInfo !== 'undefined') {
          var times = computeCpuTimes($scope.serverInfo);
          var previousTimes = computeCpuTimes($scope.previousServerInfo);

          return $scope.Math.round(
              (times.useTime - previousTimes.useTime) * 100 * 10 /
              (times.totalTime - previousTimes.totalTime)
            ) / 10;
        } else {
          return 0;
        }
      };

      var computeCpuTimes = function (serverInfo) {
        var useTime = 0;
        var totalTime = 0;
        var cpus = serverInfo.kuzzle.system.cpus;

        for (var i = 0; i < cpus.length; i++) {
          var times = cpus[i].times;
          for (var item in times) {
            if (!times.hasOwnProperty(item)) {
              continue;
            }
            totalTime += times[item];
            if (item !== 'idle') {
              useTime += times[item];
            }
          }
        }

        return {
          useTime: useTime,
          totalTime: totalTime
        };
      };

      var isOneWidgetSelected = function (widgetNames) {
        for (var i = 0; i < widgetNames.length; i++) {
          if ($scope.isWidgetSelected(widgetNames[i])) {
            return true;
          }
        }
        return false;
      };

      var drawGraph = function () {
        google.charts.setOnLoadCallback(drawTrendlines);
      };
    }]);
