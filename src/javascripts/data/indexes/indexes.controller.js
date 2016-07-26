import cogOptionsIndexes from './cogOptionsIndexes/cogOptionsIndexes.directive';
import indexesDropDownSearch from './indexesDropDownSearch/indexesDropDownSearch.directive';

let crtlName = 'IndexesCtrl';

export default [crtlName, cogOptionsIndexes, indexesDropDownSearch];


angular.module('kuzzle.indexes')

  .controller(crtlName, [
    '$scope',
    '$stateParams',
    '$state',
    'indexesApi',
    '$window',
    'authorizationApi',
    'Notification',
    function ($scope, $stateParams, $state, indexesApi, $window, authorization, Notification) {
      $scope.indexData = indexesApi.data;

      indexesApi.list();

      $scope.init = function () {
        $scope.canCreateIndex = authorization.canCreateIndex();
      };

      $scope.canDeleteIndex = function (index) {
        return authorization.canDeleteIndex(index);
      };

      $scope.browseCollection = function(index) {
        $state.go('collection.browse', {index: index});
      };

      /**
       * Delegate index creation to indexesApi service
       */
      $scope.createIndex = function (index) {
        indexesApi.create(index)
          .then(function() {
            $state.go('indexes.browse');
          })
          .catch(error => {
            Notification.error({
              delay: 10000,
              message: '<strong>Got an error while creating index: </strong><br />' + error.message
            });
            console.error(error);
          });
      };


      /**
       * Redirect the user on the corresponding list when a index is clicked
       * @param index
       */
      $scope.onSelectIndex = function (index) {
        indexesApi.isSelectedIndexValid(index, true)
          .then(function (exist) {
            if (exist) {
              indexesApi.select(index);

              $state.transitionTo($state.current, {index: index});
            }
          });
      };

      /**
       * Redirect to the index creation when the user click on link "New index"
       * @param name
       */
      $scope.onCreateIndex = function (name) {
        $state.go('indexes.create', {newIndex: name});
      };

      /**
       * Delete the index
       */
      $scope.onDeleteIndex = function () {
        setTimeout(function () {
          $state.go('', {}, {reload: true});
        }, 1000);
      };

      $scope.cancel = function () {
        $state.go('indexes.browse');
      };


    }]
);
