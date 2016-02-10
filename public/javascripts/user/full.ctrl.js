angular.module('kuzzle.user')

  .controller('UserFullCtrl', [
    '$scope',
    '$stateParams',
    'userApi',
    '$state',
    'schema',
    'previousState',
    'Notification',
    '$window',
    function ($scope, $stateParams, userApi, $state, schema, previousState, notification, $window) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.user = {
        name: $stateParams.user,
        body: ''
      };

      $scope.init = function (action) {
        var body;

        if (action === 'edit') {
          $scope.isEdit = true;

          userApi.get($scope.user.name)
            .then(function (response) {
              $scope.user.body = angular.toJson(response.body, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            body = JSON.parse($stateParams.body);
            $scope.user.body = angular.toJson(body, 4);
          }
          catch (e) {
          }
        }
      };

      $scope.cancel = function () {
        if (!previousState.get()) {
          $state.go('user.browse');
          return false;
        }

        $window.history.back();
      };

      $scope.update = function (isCreate) {
        var role = {
          name: $scope.user.name,
          body: {}
        };

        if ($scope.user.body) {
          try {
            role.body = JSON.parse($scope.user.body);
          }
          catch (e) {
            notification.error('Error parsing the user content.');
            return false;
          }
        }

        userApi.update($scope.user, true, isCreate)
          .then(function () {
            $state.go('user.browse');
          });
      };
    }]);
