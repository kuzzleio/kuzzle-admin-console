angular.module('kuzzle.storage')

  .controller('StorageFullCtrl', [
    '$scope',
    '$http',
    'documentApi',
    '$stateParams',
    function ($scope, $http, documentApi, $stateParams) {

      $scope.schema = {
        title: $stateParams.collection,
        type: "object",
        properties: {}
      };
      $scope.id = $stateParams.id;

      $scope.init = function () {
        var data = {
          filter: {ids: {values: [$stateParams.id]}}
        };

        documentApi.search($stateParams.collection, data)
          .then(function (response) {
            if (!response.data || response.data.total === 0) {
              return false;
            }

            $scope.document = response.data.documents[0].body;
          })
          .catch(function (error) {
            console.error(error);
            return false;
          })
      }
    }])

  .controller('StorageFullButtonsCtrl', [
    '$scope',
    'documentApi',
    '$stateParams',
    'Notification',
    function ($scope, documentApi, $stateParams, notification) {

      $scope.onSubmit = function () {
        var document = {
          _id: $stateParams.id,
          body: $scope.editor.getValue()
        };

        documentApi.update($stateParams.collection, document)
          .then(function (response) {
            if (!response.error) {
              notification.success('Document updated !');
            }
            else {
              notification.error('Error during document update. Please retry.')
            }
          })
      }

  }]);