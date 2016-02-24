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
    'authorizationApi',
    function ($scope, $stateParams, userApi, $state, schema, previousState, notification, $window, authorization) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.canCreateOrReplaceUser = false;
      $scope.canUpdateUser = false;
      $scope.user = {
        id: $stateParams.user,
        content: ''
      };

      $scope.init = function (action) {
        var content;

        $scope.canCreateOrReplaceUser = authorization.canDoAction('%kuzzle', '*', 'security', 'createOrReplaceUser');
        $scope.canUpdateUser = authorization.canDoAction('%kuzzle', '*', 'security', 'updateUser');

        if (action === 'edit') {
          $scope.isEdit = true;

          userApi.get($scope.user.id, false)
            .then(function (response) {
              $scope.user.content = angular.toJson(response.content, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            if ($stateParams.content) {
                content = JSON.parse($stateParams.content);
                $scope.user.content = angular.toJson(content, 4);
            }
          }
          catch (e) {
            console.error(e);
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
        var user = {
          id: $scope.user.id,
          content: {}
        };

        if ($scope.user.content) {
          try {
            user.content = JSON.parse($scope.user.content);
          }
          catch (e) {
            notification.error('Error parsing the user content.');
            return false;
          }
        }

        userApi.update(user, true, isCreate)
          .then(function () {
            $state.go('user.browse');
          });
      };
    }]);
