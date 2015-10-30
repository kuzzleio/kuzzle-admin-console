angular.module('kuzzle.storage')

  .controller('StorageFullCtrl', [
    '$scope',
    '$http',
    'documentApi',
    '$stateParams',
    'socket',
    function ($scope, $http, documentApi, $stateParams, socket) {

      $scope.schema = {
        title: $stateParams.collection,
        type: "object",
        properties: {}
      };
      $scope.id = $stateParams.id;

      $scope.init = function () {
        var
          data = {
            filter: {ids: {values: [$stateParams.id]}}
          },
          id = null;

        documentApi.search($stateParams.collection, data)
          .then(function (response) {
            if (!response.data || response.data.total === 0) {
              return false;
            }

            $scope.document = response.data.documents[0].body;
            id = response.data.documents[0]._id;

            socket.on('update:'+id)
              .forEach(function (update) {
                console.log(update);
              });
            socket.emit('document', {id: id});
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
    function ($scope, documentApi, $stateParams) {

      $scope.onSubmit = function () {
        var document = {
          _id: $stateParams.id,
          body: $scope.editor.getValue()
        };

        documentApi.update($stateParams.collection, document, true);
      }

  }]);