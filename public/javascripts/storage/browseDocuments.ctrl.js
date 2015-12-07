angular.module('kuzzle.storage')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  .controller('StorageBrowseDocumentsCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    'schema',
    'documentApi',
    '$timeout',
    '$state',
    'filter',
    function ($scope, $http, $stateParams, schema, documentApi, $timeout, $state, filterTools) {

      $scope.comparators = [
        {
          label: 'is equal to',
          value: true
        },
        {
          label: 'is not equal to',
          value: false
        }
      ];

      $scope.collection = $stateParams.collection;

      $scope.documents = null;
      $scope.error = null;

      $scope.searchType = {
        basic: true,
        advanced: false
      };

      $scope.filter = {
        basicFilter: [{
          and: [
            {field: null, equal: $scope.comparators[0], value: null}
          ]
        }],
        advancedFilter: ''
      };
      $scope.forms = {};

      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 0;

      $scope.init = function () {
        if (!$scope.collection || !$scope.collection) {
          return false;
        }

        var filters = {};
        try {
          filters = filterTools.getFiltersFromUrl($stateParams, $scope.comparators);
        } catch (e) {
          $state.go('storage.browse.documents', {basicFilter: null}, {reload: false});
        }

        if (filters.basicFilter){
          $scope.filter.basicFilter = filters.basicFilter;
          setSearchType(false);
          fillAdvancedSearchWithBasic(filters.basicFilter);
        } else if (filters.advancedFilter) {
          $scope.filter.advancedFilter = filters.advancedFilter;
          setSearchType(true);
        } else {
          setSearchType(false);
        }

        $scope.loadDocuments();
      };

      $scope.loadDocuments = function () {

        var
          filter = {};

        if ($scope.searchType.advanced) {
          try {
            filter = filterTools.formatAdvancedFilter($scope.filter.advancedFilter);
          }
          catch (e) {
            $scope.error = 'The filter JSON is not valid.';
            return false;
          }
        }
        else {
          filter = filterTools.formatBasicFilter($scope.filter.basicFilter);

          if (!filter) {
            return false;
          }
        }

        $scope.error = null;

        documentApi.search($scope.collection, filter, $scope.currentPage)
          .then(function (response) {
            if (response.error) {
              console.error(response.message);
              return false;
            }

            $scope.documents = response.data.documents;
            $scope.total = response.data.total;
            $scope.limit = response.data.limit;
          })
          .catch(function (error) {
            console.error(error);
          })
      };

      $scope.advancedSearch = function () {
        $scope.currentPage = 1;
        setSearchType(true);

        setAdvancedFilterInUrl($scope.filter.advancedFilter);
        $scope.loadDocuments();
      };

      $scope.basicSearch = function () {
        $scope.currentPage = 1;
        setSearchType(false);

        setBasicFilterInUrl($scope.filter.basicFilter);
        fillAdvancedSearchWithBasic($scope.filter.basicFilter);
        $scope.loadDocuments();
      };

      $scope.resetAdvancedFilter = function () {
        $scope.error = null;
        $scope.filter.advancedFilter = '';
      };

      /** PRIVATE METHODS **/

      var setSearchType = function (isAdvanced) {
        $scope.searchType.basic = false;
        $scope.searchType.advanced = false;

        if (isAdvanced) {
          $scope.searchType.advanced = true;
        }
        else {
          $scope.searchType.basic = true
        }
      };

      var fillAdvancedSearchWithBasic = function (basicFilter) {
        if ($scope.forms.advancedSearch && !$scope.forms.advancedSearch.$pristine) {
          return false;
        }

        var filter = filterTools.formatBasicFilter(basicFilter);
        filter = {filter: filter};
        $scope.filter.advancedFilter = angular.toJson(filter, 4);
      }

      var setBasicFilterInUrl = function (basicFilter) {
        var filter = null;

        if (Object.keys(filterTools.formatBasicFilter(basicFilter)).length !== 0) {
          filter = decodeURIComponent(angular.toJson(basicFilter));
        }
        $state.go('storage.browse.documents', {basicFilter: filter, advancedFilter: null}, {reload: false});
      }

      var setAdvancedFilterInUrl = function (advancedFilter) {
        var filter = decodeURIComponent(advancedFilter);
        $state.go('storage.browse.documents', {advancedFilter: filter, basicFilter: null}, {reload: false});
      }
  }]);
