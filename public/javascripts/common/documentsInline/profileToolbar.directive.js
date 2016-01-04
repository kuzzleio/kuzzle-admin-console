angular.module('kuzzle.documentsInline')

  .controller('ProfileToolbarCtrl', [
    '$scope',
    '$filter',
    'profileApi',
    '$timeout',
    'Notification',
    '$state',
    '$uibModal',
    function ($scope, $filter, profileApi, $timeout, notification, $state, $uibModal) {
      var modal;

      $scope.canCancelDelete = false;
      $scope.canClone = true;

      $scope.editDocument = function () {

        $scope.document.json = $filter('json')($scope.document.body);
        $scope.document.isEdit = true;
      };

      $scope.saveEditDocument = function () {
        var profile = {};

        try {
          $scope.document.body = JSON.parse($scope.document.json);
          $scope.document.isEdit = false;

          profile = {name: $scope.document._id, body: $scope.document.body};
          profileApi.update(profile, true, false);
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
          templateUrl: 'javascripts/common/documentsInline/modalDeleteProfile.tpl.html',
          scope: $scope
        });
      };

      $scope.confirmDelete = function () {
        profileApi.deleteById($scope.document._id, true)
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

        $state.go('profile.create', {body: body});
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
      };

      $scope.buildUrlFull = function (document) {
        return $state.href('profile.full', {profile: document._id});
      };
  }])
  .directive('profileToolbar', [function () {
    return {
      restrict: 'E',
      scope: {
        document: '=',
        canEdit: '=',
        afterDelete: '&'
      },
      controller: 'ProfileToolbarCtrl',
      templateUrl: '/javascripts/common/documentsInline/toolbar.tpl.html'
    }
  }]);