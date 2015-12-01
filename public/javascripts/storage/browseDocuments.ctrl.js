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
    '$filter',
    'documentApi',
    '$timeout',
    '$state',
    function ($scope, $http, $stateParams, schema, $filter, documentApi, $timeout, $state) {

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
      $scope.limit = 0;

      /**
       * Call on DOM init.
       * Parse get parameters from url and get documents for the corresponding filters
       * @returns {boolean}
       */
      $scope.init = function () {
        if (!$scope.collection || !$scope.collection) {
          return false;
        }

        filterTools.getFiltersFromUrl();
        $scope.loadDocuments();
      };

      /**
       * Load documents according to filters
       * @returns {boolean}
       */
      $scope.loadDocuments = function () {

        var
          filter = {};

        if ($scope.searchType.advanced) {
          try {
            filter = filterTools.formatAdvancedFilter();
          }
          catch (e) {
            $scope.error = 'The filter JSON is not valid.';
            return false;
          }
        }
        else {
          filter = filterTools.formatBasicFilter();

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

      /**
       * Trigger an advanced search
       */
      $scope.advancedSearch = function () {
        $scope.currentPage = 1;
        setSearchType(true);

        filterTools.setAdvancedFilterInUrl();
        $scope.loadDocuments();
      };

      /**
       * Trigger an basic search
       */
      $scope.basicSearch = function () {
        $scope.currentPage = 1;
        setSearchType(false);

        filterTools.setBasicFilterInUrl();
        filterTools.fillAdvancedSearchWithBasic();
        $scope.loadDocuments();
      };

      /** PRIVATE METHODS **/
      var filterTools = {
        /**
         * Parse the url and get basic or advanced search
         */
        getFiltersFromUrl: function () {
          var filters = [];

          if ($stateParams.basicFilter) {
            try {
              filters = JSON.parse(decodeURIComponent($stateParams.basicFilter));
            }
            catch (e) {
              $state.go('storage.browse.documents', {basicFilter: null}, {reload: false});
              return false;
            }

            filters = filters.map(function (group) {
              group.and = group.and.map(function (term) {
                if (term.equal.value) {
                  term.equal = $scope.comparators[0];
                }
                else {
                  term.equal = $scope.comparators[1];
                }

                return term;
              });

              return group;
            });

            $scope.filter.basicFilter = filters;
            this.fillAdvancedSearchWithBasic();
            setSearchType(false);
          }
          else if ($stateParams.advancedFilter) {
            $scope.filter.advancedFilter = $stateParams.advancedFilter;
            setSearchType(true);
          }
          else {
            setSearchType(false);
          }
        },
        /**
         * When the user perform a basic filter, we have to change the url according to this filter
         */
        setBasicFilterInUrl: function () {
          var filter = null;

          if (Object.keys(this.formatBasicFilter()).length !== 0) {
            filter = decodeURIComponent(angular.toJson($scope.filter.basicFilter));
          }
          $state.go('storage.browse.documents', {basicFilter: filter, advancedFilter: null}, {reload: false});
        },
        /**
         * When the user perform a advanced filter, we have to change the url according to this filter
         */
        setAdvancedFilterInUrl: function () {
          var filter = decodeURIComponent($scope.filter.advancedFilter);
          $state.go('storage.browse.documents', {advancedFilter: filter, basicFilter: null}, {reload: false});
        },
        formatAdvancedFilter: function () {
          if ($scope.filter.advancedFilter === '') {
            return {};
          }

          try {
            var advancedFilter = JSON.parse($scope.filter.advancedFilter);

            if (advancedFilter.filter) {
              return advancedFilter.filter;
            }
            else {
              return advancedFilter.query;
            }
          }
          catch (e) {
            return {}
          }
        },
        formatBasicFilter: function () {
          var
            or = [],
            and = [],
            formattedTerm = {},
            length = $scope.filter.basicFilter.length,
            error = false;

          $scope.filter.basicFilter.forEach(function (group) {

            and = [];
            group.and.forEach(function (term) {
              term.error = false;

              // If one of both input (field or value) is not specified, it's an error
              if ((!term.field && term.value) || (term.field && !term.value)) {
                if (length > 1) {
                  term.error = true;
                  error = true;
                }
                return false;
              }

              if (!term.field && !term.value) {
                return false;
              }

              if (term.equal.value) {
                formattedTerm = {term: {}};
                formattedTerm.term[term.field] = term.value;
                and.push(formattedTerm);
              }
              else {
                formattedTerm = {not: {term: {}}};
                formattedTerm.not.term[term.field] = term.value;
                and.push(formattedTerm);
              }
            });

            or.push({and: and});
          });

          if (error) {
            return false;
          }

          if (or.length === 0) {
            return {};
          }

          if (or.length === 1 && or[0].and.length === 0) {
            return {};
          }

          return {or: or};
        },
        fillAdvancedSearchWithBasic: function () {
          if ($scope.forms.advancedSearch && !$scope.forms.advancedSearch.$pristine) {
            return false;
          }


          var filter = this.formatBasicFilter();
          filter = {filter: filter};
          $scope.filter.advancedFilter = angular.toJson(filter, 4);
        }
      };

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

  }]);