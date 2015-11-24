angular.module('kuzzle.storage')

  .controller('StorageFullCtrl', [
    '$scope',
    '$http',
    'documentApi',
    '$stateParams',
    '$state',
    'Notification',
    'schema',
    'previousState',
    '$window',
    function ($scope, $http, documentApi, $stateParams, $state, notification, schema, previousState, $window) {

      $scope.schema = {};
      $scope.collection = $stateParams.collection;
      $scope.isEdit = false;
      $scope.exists = false;
      $scope.isLoading = false;
      $scope.another = false;

      $scope.document = {id: $stateParams.id, body: null};

      var message = null;

      $scope.init = function (action) {

        schema.buildFormatter($stateParams.collection)
          .then(function (schema) {
            $scope.schema = schema;
          });

        if (action === 'edit') {
          $scope.isEdit = true;
          $scope.exists = true;

          documentApi.getById($stateParams.collection, $stateParams.id)
            .then(function (response) {
              if (response.data && response.data.error) {
                $scope.notFoundError = true;
                return false;
              }

              $scope.document.body = response.data.document.body;
              $scope.document.id = response.data.document._id;

              $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
                $scope.document.body.location.lat = args.model.lat;
                $scope.document.body.location.lon = args.model.lng;
              });

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
            });
        }
      };

      $scope.documentExists = function () {

        $scope.exists = false;

        if (!$scope.document.id || $scope.document.id === '') {
          return false;
        }

        $scope.isLoading = true;
        documentApi.getById($stateParams.collection, $scope.document.id)
          .then(function (response) {
            $scope.isLoading = false;

            if (response.data && response.data.document) {
              $scope.exists = true;
              return false;
            }

            $scope.exists = false;
          });
      };

      $scope.create = function () {
        documentApi.create($scope.collection, $scope.document.body, true)
          .then(function (response) {
            if ($scope.another) {
              $state.reload();
            }

            $scope.document.id = response.id;
            $scope.exists = true;
          });
      };

      $scope.update = function () {
        var document = {
          _id: $scope.document.id,
          body: $scope.document.body
        };

        console.log(document);
        //documentApi.update($stateParams.collection, document, true);
      };

      $scope.goToList = function () {
        var previous = previousState.get();

        if (previous && previous.name === 'storage.browse.documents') {
          $window.history.back();
          return false;
        }

        $state.go('storage.browse.documents', {collection: $stateParams.collection}, {reload: false});
      };

      $scope.refresh = function () {
        $state.reload();
        message.then(function (notificationScope) {
          notificationScope.kill(true);
        })
      };
    }]);