angular.module('kuzzle.storage')

  .controller('StorageFullCtrl', [
    '$scope',
    '$http',
    'documentApi',
    '$stateParams',
    '$state',
    'Notification',
    function ($scope, $http, documentApi, $stateParams, $state, notification) {

      $scope.schema = {
        title: $stateParams.collection,
        type: "object",
        properties: {}
      };
      $scope.id = $stateParams.id;

      var message = null;

      $scope.init = function () {
        var
          data = {
            filter: {ids: {values: [$stateParams.id]}}
          };

        documentApi.search($stateParams.collection, data)
          .then(function (response) {
            if (!response.data || response.data.total === 0) {
              return false;
            }

            $scope.document = response.data.documents[0].body;
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
      }
    }])

  .controller('StorageFullButtonsCtrl', [
    '$scope',
    'documentApi',
    '$stateParams',
    function ($scope, documentApi, $stateParams) {

      $scope.onSubmit = function () {
        var document = {
          _id: $stateParams.id,
          body: $scope.editor.getValue()
        };

        documentApi.update($stateParams.collection, document, true);
      }

  }]);