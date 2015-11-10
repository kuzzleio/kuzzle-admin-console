angular.module('kuzzle.storage')

  .controller('StorageFullCtrl', [
    '$scope',
    '$http',
    'documentApi',
    '$stateParams',
    '$state',
    'Notification',
    'schema',
    function ($scope, $http, documentApi, $stateParams, $state, notification, schema) {

      $scope.schema = {};
      $scope.id = $stateParams.id;

      var message = null;

      $scope.init = function () {

        schema.buildFormatter($stateParams.collection)
          .then(function (schema) {
            $scope.schema = schema;
          });
        documentApi.getById($stateParams.collection, $stateParams.id)
          .then(function (response) {
            if (response.data && response.data.error) {
              console.error(response.data);
              return false;
            }

            $scope.document = response.data.document.body;
            documentApi.subscribeId($stateParams.collection, $stateParams.id, function () {
              message = notification.info({
                message:'Someone has update this document',
                templateUrl: 'refreshTemplate.html',
                delay: null,
                scope: $scope,
                closeOnClick: false
              });
            });

          })
          .catch(function (error) {
            console.error(error);
            return false;
          })
      };

      $scope.refresh = function () {
        $state.reload();
        message.then(function (notificationScope) {
          notificationScope.kill(true);
        })
      };
    }])

  .controller('StorageFullButtonsCtrl', [
    '$scope',
    'documentApi',
    '$stateParams',
    '$state',
    function ($scope, documentApi, $stateParams, $state) {

      $scope.onSubmit = function () {
        var document = {
          _id: $stateParams.id,
          body: $scope.editor.getValue()
        };

        documentApi.update($stateParams.collection, document, true);
      };

      $scope.goBack = function () {
        console.log($state);
      };
  }]);