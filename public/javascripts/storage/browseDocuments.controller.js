angular.module('kuzzle.storage')

  .config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {
    JSONFormatterConfigProvider.hoverPreviewEnabled = true;
    JSONFormatterConfigProvider.hoverPreviewArrayCount = 5;
  }])

  /** This controller is used for display and manage the document list */
  .controller('StorageBrowseDocumentsCtrl', [
    '$scope',
    '$http',
    '$stateParams',
    'schema',
    'documentApi',
    '$timeout',
    '$state',
    'filters',
    'authorizationApi',
    function ($scope, $http, $stateParams, schema, documentApi, $timeout, $state, filterTools, authorization) {

      // List comparators for Basic filter block
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

      // The selected collection
      $scope.collection = $stateParams.collection;
      // Documents list
      $scope.documents = null;

      // The user can use either a basic search (with term) or an advanced filter
      $scope.searchType = {
        basic: true,
        advanced: false
      };

      // Contains all filter: basic and advanced. The advanced filter is a string
      $scope.filter = {
        basicFilter: [{
          and: [
            {field: null, equal: $scope.comparators[0], value: null}
          ]
        }],
        advancedFilter: ''
      };
      // Contains the form. Allow to get state (like pristine)
      $scope.forms = {};

      // Manage pagination
      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 10;

      /**
       * Call on DOM init.
       * Parse get parameters from url and get documents for the corresponding filters
       * @returns {boolean}
       */
      $scope.init = function () {
        if (!$scope.collection || !$scope.collection) {
          return false;
        }

        $scope.canCreateDocument =  authorization.canDoAction($stateParams.index, $scope.collection, 'write', 'create');
        $scope.canReadDocument = authorization.canDoAction($stateParams.index, $scope.collection, 'read', 'search');
        $scope.canEditDocument = authorization.canDoAction($stateParams.index, $scope.collection, 'write', 'createOrReplace');
        $scope.canDeleteDocument = authorization.canDoAction($stateParams.index, $scope.collection, 'write', 'delete');

        var filters = {};
        try {
          filters = filterTools.getFiltersFromUrl($stateParams, $scope.comparators);
        } catch (e) {
          $state.go('storage.browse.documents', {basicFilter: null}, {reload: false});
        }

        if (filters.basicFilter) {
          $scope.filter.basicFilter = filters.basicFilter;
          setSearchType(false);
        } else if (filters.advancedFilter) {
          $scope.filter.advancedFilter = filters.advancedFilter;
          setSearchType(true);
        } else {
          setSearchType(false);
        }

        if ($scope.canReadDocument) {
          $scope.loadDocuments();
        }

      };



      /**
       * Load documents according to filters
       * @returns {boolean}
       */
      $scope.loadDocuments = function () {

        var
          filter = {};

        if (!$scope.canReadDocument) {
          return false;
        }

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
          filter = filterTools.formatBasicFilter($scope.filter.basicFilter, false);

          if (!filter) {
            return false;
          }
        }

        $scope.error = null;

        filter.from = ($scope.currentPage - 1) * $scope.limit;
        filter.size = $scope.limit;

        documentApi.search($scope.collection, filter)
          .then(function (response) {
            if (response.error) {
              console.error(response.message);
              return false;
            }

            $scope.documents = response.documents;
            $scope.total = response.total;
          })
          .catch(function (error) {
            console.error(error);
          });
      };

      /**
       * Trigger an advanced search
       */
      $scope.advancedSearch = function () {
        $scope.currentPage = 1;
        setSearchType(true);

        setAdvancedFilterInUrl($scope.filter.advancedFilter);
        $scope.loadDocuments();
      };

      /**
       * Trigger an basic search
       */
      $scope.basicSearch = function () {
        $scope.currentPage = 1;
        setSearchType(false);

        setBasicFilterInUrl($scope.filter.basicFilter);
        $scope.loadDocuments();
      };

      /** PRIVATE METHODS **/

      var setSearchType = function (isAdvanced) {
        $scope.searchType.basic = false;
        $scope.searchType.advanced = false;

        if (isAdvanced) {
          $scope.searchType.advanced = true;
        }
        else {
          $scope.searchType.basic = true;
        }
      };

      var setBasicFilterInUrl = function (basicFilter) {
        var filter = null;

        if (Object.keys(filterTools.formatBasicFilter(basicFilter)).length !== 0) {
          filter = decodeURIComponent(angular.toJson(basicFilter));
        }
        $state.go('storage.browse.documents', {basicFilter: filter, advancedFilter: null}, {reload: false});
      };

      var setAdvancedFilterInUrl = function (advancedFilter) {
        var filter = decodeURIComponent(advancedFilter);
        $state.go('storage.browse.documents', {advancedFilter: filter, basicFilter: null}, {reload: false});
      };
  }]);
