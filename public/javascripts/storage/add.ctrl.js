angular.module('kuzzle.storage')

  .controller('StorageAddCtrl', [
    '$scope',
    '$http',
    'documentApi',
    'schema',
    '$stateParams',
    function ($scope, $http, documentApi, schema, $stateParams) {

      $scope.schema = {};

      $scope.init = function () {
        schema.buildFormatter($stateParams.collection)
          .then(function (schema) {
            $scope.schema = schema;
          });
      };

    }])

  .controller('StorageFullButtonsCtrl', [
    '$scope',
    'documentApi',
    '$stateParams',
    function ($scope, documentApi, $stateParams) {

      $scope.collection = $stateParams.collection;

      $scope.onSubmit = function () {
        documentApi.create($scope.collection, $scope.editor.getValue(), true);
      }

  }]);