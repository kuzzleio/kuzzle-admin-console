import jsonEdit from '../../common/components/jsonEdit/jsonEdit.directive';
import cogOptionsCollection from '../../data/collection/cogOptionsCollection/cogOptionsCollection.directive';
import documentsInline from '../../common/components/documentsInline/documentsInline.directive';
import profileToolbar from '../../common/components/documentsInline/profileToolbar.directive';
import profileApi from '../../common/services/profileApi.service';
import authorizationApi from '../../authentication/authorizationApi.service';

const ctrlName = 'ProfileBrowseCtrl';

export default [profileApi, jsonEdit, cogOptionsCollection, documentsInline,
  profileToolbar, ctrlName, authorizationApi];

angular.module('kuzzle.profile')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller(ctrlName, [
    '$scope',
    'profileApi',
    'authorizationApi',
    function ($scope, profileApi, authorization) {

      // Manage pagination
      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 10;
      $scope.canUpdateProfile = false;

      $scope.profiles = [];

      $scope.init = function () {
        $scope.canUpdateProfile = authorization.canDoAction('%kuzzle', '*', 'security', 'updateProfile');

        $scope.loadProfiles();
      };

      $scope.loadProfiles = function() {
        profileApi.list(($scope.currentPage - 1) * $scope.limit, $scope.limit)
          .then(function (response) {
            console.log(response.profiles);
            $scope.total = response.total;
            $scope.profiles = response.profiles;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.$on('$viewContentLoaded', $scope.init);
    }
  ]);
