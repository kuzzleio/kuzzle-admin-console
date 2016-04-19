import jsonEdit from '../common/jsonEdit/jsonEdit.directive';
import addAttribute from '../storage/addAttribute/addAttribute.directive';
import collectionApi from '../common/collectionApi.service';
import uiNotification from 'angular-ui-notification';
import prevousState from '../common/previousState.service.js';
import authorizationApi from '../common/authentication/authorizationApi.service';
import schemaService from '../common/schema.service';

var ctrlName = 'CollectionFullCtrl';

export default [ctrlName, addAttribute, jsonEdit, collectionApi, uiNotification,
  schemaService];

angular.module('kuzzle.collection')

  .controller(ctrlName, [
    '$scope',
    '$stateParams',
    'collectionApi',
    '$state',
    'schema',
    'previousState',
    '$window',
    'Notification',
    function ($scope, $stateParams, collectionApi, $state, schema, previousState, $window, notification) {

      $scope.isEdit = false;
      $scope.collection = {
        name: $stateParams.collection || $stateParams.newCollection,
        schema: ''
      };

      $scope.init = function (action) {
        if (action === 'edit') {
          $scope.isEdit = true;

          schema.get($scope.collection.name)
            .then(function (response) {
              $scope.collection.schema = angular.toJson(response.mapping, 4);
            })
            .catch(function (error) {

            });
        }
      };

      $scope.update = function (isCreate) {
        var collection = {
          name: $scope.collection.name,
          schema: {}
        };

        if ($scope.collection.schema) {
          try {
            collection.schema = JSON.parse($scope.collection.schema);
          }
          catch (e) {
            notification.error('Error parsing schema.');
            return false;
          }
        }

        collectionApi.putMapping(collection, true, isCreate)
          .then(function () {
            if (!previousState.get() || previousState.get().url.indexOf('collection') !== -1) {
              $state.go('storage.browse.documents', {collection: $scope.collection.name});
              return false;
            }

            $window.history.back();
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.cancel = function () {
        if (!previousState.get()) {
          $state.go('collection.browse');
          return false;
        }

        $window.history.back();
      };
    }]);
