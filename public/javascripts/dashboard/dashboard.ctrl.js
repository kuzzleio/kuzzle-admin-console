angular.module('kuzzle.dashboard')
  .controller('DashboardCtrl', [
    '$scope',
    'serverApi',
    'notification',
    '$state',
    '$stateParams',
    function ($scope, serverApi, notificationTools, $state, $stateParams) {
      'use strict';

      $scope.init = function () {
        serverApi.getServerInfo()
          .then(function (response) {
            $scope.serverInfo = response;
          });
        serverApi.getAllStatistics()
          .then(function (response) {
            $scope.allStatistics = response;
            console.log(response);
          });
        serverApi.getNowTimestamp()
          .then(function (response) {
            $scope.nowTimestamp = response;
          });
      };

      $scope.updateStatistics = function () {

      };
    }]);
