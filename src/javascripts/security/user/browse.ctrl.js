import jsonEdit from '../../common/jsonEdit/jsonEdit.directive';
import cogOptionsCollection from '../../collection/cogOptionsCollection/cogOptionsCollection.directive';
import documentsInline from '../../common/documentsInline/documentsInline.directive';
import userToolbar from '../../common/documentsInline/userToolbar.directive';
import userApi from '../../common/userApi.service';
import authorizationApi from '../../authentication/authorizationApi.service';

const ctrlName = 'UserBrowseCtrl';

export default [userApi, jsonEdit, cogOptionsCollection, documentsInline,
  userToolbar, ctrlName, authorizationApi];

angular.module('kuzzle.user')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller(ctrlName, [
    '$scope',
    'userApi',
    'authorizationApi',
    function ($scope, userApi, authorization) {

      // Manage pagination
      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 10;

      $scope.users = [];
      $scope.canUpdateUser = false;

      $scope.init = function () {
        $scope.canUpdateUser = authorization.canDoAction('%kuzzle', '*', 'security', 'updateUser');

        $scope.loadUsers();
      };

      $scope.loadUsers = function() {
        userApi.list(($scope.currentPage - 1) * $scope.limit, $scope.limit)
          .then(function (response) {
            $scope.total = response.total;
            $scope.users = response.users;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      $scope.$on('$viewContentLoaded', $scope.init);
    }
  ]);
