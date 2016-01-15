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

        $scope.document.json = $filter('json')($scope.document.body);
        $scope.document.isEdit = true;
      };

      $scope.saveEditDocument = function () {
        var user = {};

        try {
          $scope.document.body = JSON.parse($scope.document.json);
          $scope.document.isEdit = false;

          user = {name: $scope.document._id, body: $scope.document.body};
          userApi.update(user, true, false);
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
          templateUrl: 'javascripts/common/documentsInline/modalDeleteUser.tpl.html',
          scope: $scope
        });
      };

      $scope.confirmDelete = function () {
        userApi.deleteById($scope.document._id, true)
          .then(function () {
            $scope.cancelModal();
            $scope.afterDelete();
          })
      };

      $scope.clone = function () {
        var body = '';

        try {
          body = JSON.stringify($scope.document.body);
        }
        catch (e) {
          console.error(e);
        }

        $state.go('user.create', {body: body});
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
      };

      $scope.buildUrlFull = function (document) {
        return $state.href('user.full', {user: document._id});
      };
  }])
  .directive('userToolbar', [function () {
    return {
      restrict: 'E',
      scope: {
        document: '=',
        canEdit: '=',
        afterDelete: '&'
      },
      controller: 'UserToolbarCtrl',
      templateUrl: '/javascripts/common/documentsInline/toolbar.tpl.html'
    }
  }]);