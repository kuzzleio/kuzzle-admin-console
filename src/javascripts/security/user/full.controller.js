import jsonEdit from '../../common/components/jsonEdit/jsonEdit.directive';
import addAttribute from '../../data/storage/addAttribute/addAttribute.directive';
import userApi from '../../common/services/userApi.service';
import uiNotification from 'angular-ui-notification';
import prevousState from '../../common/services/previousState.service.js';
import authorizationApi from '../../authentication/authorizationApi.service';

var ctrlName = 'UserFullCtrl';

export default [ctrlName, addAttribute, jsonEdit, userApi, uiNotification];

angular.module('kuzzle.user')

  .controller(ctrlName, [
    '$scope',
    '$stateParams',
    'userApi',
    '$state',
    'previousState',
    'Notification',
    '$window',
    'authorizationApi',
    function ($scope, $stateParams, userApi, $state, previousState, notification, $window, authorization) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.canCreateOrReplaceUser = false;
      $scope.canUpdateUser = false;
      $scope.user = {
        id: $stateParams.user,
        content: ''
      };

      $scope.init = function () {
        var content;

        $scope.canCreateOrReplaceUser = authorization.canDoAction('%kuzzle', '*', 'security', 'createOrReplaceUser');
        $scope.canUpdateUser = authorization.canDoAction('%kuzzle', '*', 'security', 'updateUser');

        if ($stateParams.user) {
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

      $scope.create = function () {
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

        userApi.createOrReplace(user, true, true)
          .then(function () {
            $state.go('user.browse');
          });
      };

      $scope.update = function () {
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

        userApi.update(user, true)
          .then(function () {
            $state.go('user.browse');
          });
      };

      $scope.replace = function () {
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

        if ($window.confirm('You are about to replace user "' + $scope.user.id + '", are you sure ?')) {
          userApi.createOrReplace(user, true, false)
            .then(function () {
              $state.go('user.browse');
            });
        }
      };
    }]);
