require('./documentsInline.directive');

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

        $scope.document.json = $filter('json')($scope.document.content);
        $scope.document.isEdit = true;
      };

      $scope.saveEditDocument = function () {
        var profile = {
          id: $scope.document.id,
          content: {}
        };

        try {
          profile.content = JSON.parse($scope.document.json);
          $scope.document.isEdit = false;

          profileApi.update(profile, true)
            .then(function() {
              $scope.document.content = angular.extend($scope.document.content, profile.content);
            });
        }
        catch (e) {
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
        profileApi.deleteById($scope.document.id, true)
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

        $state.go('profile.create', {content: content});
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
      };

      $scope.buildUrlFull = function (document) {
        return $state.href('profile.full', {profile: document.id});
      };
    }
  ])
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
    };
  }]);
