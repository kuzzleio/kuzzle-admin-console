import gaugeDirective from '../common/gauge/gauge.directive.js';
import chartDirective from '../common/chart/chart.directive.js';
import widgetDirective from '../common/widget/widget.directive.js';

import authorizationApi from '../authentication/authorizationApi.service';
import serverApi from '../common/serverApi.service';

let ctrlName = 'MetricsCtrl';

export default [ctrlName, gaugeDirective, chartDirective, widgetDirective,
  authorizationApi, serverApi];

angular.module('kuzzle.metrics')
  .controller(ctrlName, [
    '$scope',
    '$window',
    'serverApi',
    '$timeout',
    'authorizationApi',
    'indexesApi',
    function ($scope, $window, serverApi, $timeout, authorization, indexesApi) {
      'use strict';
      var timer = {
        serverInfo: null,
        statistics: null
      };

      indexesApi.data.showSelector = false;

      $scope.Math = $window.Math;
      $scope.timeFrame = 86400 * 1000;
      $scope.widgets = [
        'serverInfo',
        'pluginInfo',
        'apiInfo',
        'statInfo',
        'resourceInfo'
      ];
      $scope.memoryPercent = 0;
      $scope.cpuPercent = 0;
      $scope.statisticSeries = [];
      $scope.newStatValue = [];

      $scope.$on('$destroy', function() {
        $timeout.cancel(timer.serverInfo);
        $timeout.cancel(timer.statistics);
      });

      $scope.init = function () {
        $scope.canGetServerInfo = authorization.canDoAction('foobar', 'foobar', 'read', 'serverInfo');
        $scope.canGetStats = authorization.canDoAction('foobar', 'foobar', 'admin', 'getStats') &&
          authorization.canDoAction('foobar', 'foobar', 'admin', 'getLastStats') &&
          authorization.canDoAction('foobar', 'foobar', 'read', 'now');
        if ($scope.isWidgetSelected('statInfo') && $scope.canGetStats) {
          serverApi.getNowTimestamp()
            .then(function (response) {
              $scope.nowTimestamp = response;
              return serverApi.getStatistics($scope.nowTimestamp - $scope.timeFrame);
            })
            .then(function (response) {
              $scope.statisticSeries = arrangeStatistics(response);
              return serverApi.getNowTimestamp();
            })
            .then(function (response) {
              $scope.nowTimestamp = response;
              timer.statistics = $timeout($scope.refreshStatistics, 5000);
            });
        }
        if (isOneWidgetSelected(['serverInfo', 'pluginInfo', 'apiInfo', 'resourceInfo']) && $scope.canGetServerInfo) {
          timer.serverInfo = $scope.refreshServerInfo();
        }
      };

      $scope.refreshServerInfo = function () {
        serverApi.getServerInfo()
          .then(function (response) {
            if (typeof $scope.serverInfo !== 'undefined') {
              $scope.previousServerInfo = $scope.serverInfo;
            }
            $scope.serverInfo = response;
            $scope.memoryPercent = computeMemoryUsePercent();
            $scope.cpuPercent = computeCpuUsePercent();
            timer.serverInfo = $timeout($scope.refreshServerInfo, 1000);
          });
      };

      $scope.refreshStatistics = function () {
        serverApi.getStatistics()
          .then(function (response) {
            var temp = arrangeStatistics(response);
            if ($scope.newStatValue.length === 0 || $scope.newStatValue[0].data[0][0] !== temp[0].data[0][0]) {
              $scope.newStatValue = temp;
            }
            serverApi.getNowTimestamp()
              .then(function (response) {
                $scope.nowTimestamp = response;
                timer.statistics = $timeout($scope.refreshStatistics, 5000);
              });
          });
      };

      $scope.isWidgetSelected = function (widgetName) {
        return $scope.widgets.indexOf(widgetName) !== -1;
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

      var arrangeStatistics = function (statistics) {
        var series = [
          {name: 'Connections', data: []},
          {name: 'Completed', data: []},
          {name: 'Failed', data: []},
          {name: 'Ongoing', data: []}
        ];
        var statisticProperties = ['connections', 'completedRequests', 'failedRequests', 'ongoingRequests'];

        for (var i = 0; i < statistics.length; i++) {
          var timestamp = new Date(statistics[i].timestamp);
          for (var item = 0; item < statisticProperties.length; item++) {
            var current = 0;
            var property = statisticProperties[item];
            if (statistics[i].hasOwnProperty(property)) {
              for (var protocol in statistics[i][property]) {
                if (statistics[i][property].hasOwnProperty(protocol) && statistics[i][property][protocol] !== null) {
                  current += statistics[i][property][protocol];
                }
              }
            }
            series[item].data.push([(timestamp).getTime(), current]);
          }

        }
        return series;
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
    }])
    .name;
