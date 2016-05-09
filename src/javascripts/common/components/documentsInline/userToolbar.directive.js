require('./documentsInline.directive');

angular.module('kuzzle.documentsInline')

  .controller('UserToolbarCtrl', [
    '$scope',
    '$filter',
    'userApi',
    '$timeout',
    'Notification',
    '$state',
    '$uibModal',
    function ($scope, $filter, userApi, $timeout, notification, $state, $uibModal) {
      var modal;

      $scope.canCancelDelete = false;
      $scope.canClone = true;

      $scope.editDocument = function () {

        $scope.document.json = $filter('json')($scope.document.content);
        $scope.document.isEdit = true;
      };

      $scope.saveEditDocument = function () {
        var user = {
          id: $scope.document.id,
          content: {}
        };

        try {
          user.content = JSON.parse($scope.document.json);
          $scope.document.isEdit = false;

          userApi.update(user, true)
            .then(function() {
              $scope.document.content = angular.extend($scope.document.content, user.content);
            });
        }
        catch (e) {
          console.error(e);
          notification.error('Error parsing user.');
        }
      };

      $scope.cancelEditDocument = function () {
        $scope.document.isEdit = false;
      };

      $scope.delete = function () {
        modal = $uibModal.open({
          templateUrl: '/templates/common/components/documentsInline/modalDeleteUser.tpl.html',
          scope: $scope
        });
      };

      $scope.confirmDelete = function () {
        userApi.deleteById($scope.document.id, true)
          .then(function () {
            $scope.cancelModal();
            $scope.afterDelete();
          });
      };

      $scope.clone = function () {
        var content = '';

        try {
          content = JSON.stringify($scope.document.content);
        }
        catch (e) {
          console.error(e);
        }

        $state.go('user.create', {content: content});
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
      };

      $scope.buildUrlFull = function (document) {
        return $state.href('user.full', {user: document.id});
      };
    }
  ])
  .directive('userToolbar', [function () {
    return {
      restrict: 'E',
      scope: {
        index: '=',
        collection: '=',
        document: '=',
        canEdit: '=',
        afterDelete: '&'
      },
      controller: 'UserToolbarCtrl',
      templateUrl: '/templates/common/components/documentsInline/toolbar.tpl.html'
    };
  }]);
