import jsonEdit from '../../common/components/jsonEdit/jsonEdit.directive';
import schemaService from '../../common/services/schema.service';
import profileApi from '../../common/services/profileApi.service';
import uiNotification from 'angular-ui-notification';
import prevousState from '../../common/services/previousState.service.js';
import authorizationApi from '../../authentication/authorizationApi.service';

var ctrlName = 'ProfileFullCtrl';

export default [ctrlName, jsonEdit, schemaService, uiNotification, prevousState,
  authorizationApi, profileApi];

angular.module('kuzzle.profile')

  .controller(ctrlName, [
    '$scope',
    '$stateParams',
    'profileApi',
    '$state',
    'schema',
    'previousState',
    'Notification',
    '$window',
    'authorizationApi',
    function ($scope, $stateParams, profileApi, $state, schema, previousState, notification, $window, authorization) {

      $scope.isEdit = false;
      $scope.notFoundError = false;
      $scope.canCreateOrReplaceProfile = false;
      $scope.canUpdateProfile = false;
      $scope.profile = {
        id: $stateParams.profile,
        content: ''
      };

      $scope.init = function () {
        var content;

        $scope.canCreateOrReplaceProfile = authorization.canDoAction('%kuzzle', '*', 'security', 'createOrReplaceProfile');
        $scope.canUpdateProfile = authorization.canDoAction('%kuzzle', '*', 'security', 'updateProfile');

        if ($stateParams.profile) {
          $scope.isEdit = true;

          profileApi.get($scope.profile.id, false)
            .then(function (response) {
              $scope.profile.content = angular.toJson(response.content, 4);
            })
            .catch(function () {
              $scope.notFoundError = true;
            });
        }
        else {
          try {
            content = JSON.parse($stateParams.content);
            $scope.profile.content = angular.toJson(content, 4);
          }
          catch (e) {
            console.error(e);
          }
        }
      };

      $scope.cancel = function () {
        if (!previousState.get()) {
          $state.go('profile.browse');
          return false;
        }

        $window.history.back();
      };

      $scope.create = function () {
        var profile = {
          id: $scope.profile.id,
          content: {}
        };

        if ($scope.profile.content) {
          try {
            profile.content = JSON.parse($scope.profile.content);
          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        profileApi.createOrReplace(profile, true, true)
          .then(function () {
            $state.go('profile.browse');
          });
      };

      $scope.replace = function () {
        var profile = {
          id: $scope.profile.id,
          content: {}
        };

        if ($scope.profile.content) {
          try {
            profile.content = JSON.parse($scope.profile.content);
          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        if ($window.confirm('You are about to replace profile "' + $scope.profile.id + '", are you sure ?')) {
          profileApi.createOrReplace(profile, true, false)
            .then(function () {
              $state.go('profile.browse');
            });
        }
      };

      $scope.update = function () {
        var profile = {
          id: $scope.profile.id,
          content: {}
        };

        if ($scope.profile.content) {
          try {
            profile.content = JSON.parse($scope.profile.content);
          }
          catch (e) {
            notification.error('Error parsing the role content.');
            return false;
          }
        }

        profileApi.update(profile, true)
          .then(function () {
            $state.go('profile.browse');
          });
      };
    }]);
