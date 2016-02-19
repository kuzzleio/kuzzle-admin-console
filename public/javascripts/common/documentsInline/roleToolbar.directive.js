angular.module('kuzzle.documentsInline')

  .controller('RoleToolbarCtrl', [
    '$scope',
    '$filter',
    'roleApi',
    '$timeout',
    'Notification',
    '$state',
    '$uibModal',
    function ($scope, $filter, roleApi, $timeout, notification, $state, $uibModal) {
      var modal;

      $scope.canCancelDelete = false;
      $scope.canClone = true;

      $scope.editDocument = function () {

        $scope.document.json = $filter('json')($scope.document.content);
        $scope.document.isEdit = true;
      };

      $scope.saveEditDocument = function () {
        var role = {};

        try {
          $scope.document.content = JSON.parse($scope.document.json);
          $scope.document.isEdit = false;

          role = {id: $scope.document.id, content: $scope.document.content};
          roleApi.update(role, true);
        }
        catch (e) {
          console.error(e);
          notification.error('Error parsing role.');
        }
      };

      $scope.cancelEditDocument = function () {
        $scope.document.isEdit = false;
      };

      $scope.delete = function () {
        modal = $uibModal.open({
          templateUrl: 'javascripts/common/documentsInline/modalDeleteRole.tpl.html',
          scope: $scope
        });
      };

      $scope.confirmDelete = function () {
        roleApi.deleteById($scope.document.id, true)
          .then(function () {
            $scope.cancelModal();
            $scope.afterDelete({document: $scope.document});
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

        $state.go('role.create', {content: content});
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
      };

      $scope.buildUrlFull = function (document) {
        return $state.href('role.full', {role: document.id});
      };
    }
  ])
  .directive('roleToolbar', [function () {
    return {
      restrict: 'E',
      scope: {
        document: '=',
        canEdit: '=',
        afterDelete: '&'
      },
      controller: 'RoleToolbarCtrl',
      templateUrl: '/javascripts/common/documentsInline/toolbar.tpl.html'
    };
  }]);
