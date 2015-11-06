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
    '$filter',
    'documentApi',
    '$timeout',
    '$state',
    'bufferCancel',
    function ($scope, $http, $stateParams, schema, $filter, documentApi, $timeout, $state, bufferCancel) {

      $scope.collection = $stateParams.collection;

      $scope.documents = false;
      $scope.error = null;

      $scope.searchType = {
        basic: true,
        advanced: false
      };
      $scope.fields = [];
      $scope.comparators = [
        {
          label: 'equal to',
          value: true
        },
        {
          label: 'not equal to',
          value: false
        }
      ];
      $scope.filter = {
        terms: [{field: null, equal: $scope.comparators[0], value: null}],
        json: ''
      };


      $scope.currentPage = 1;
      $scope.total = 0;
      $scope.limit = 0;


      $scope.init = function () {
        if (!$scope.collection || !$scope.collection) {
          return false;
        }

        getSchema();
        filterTools.getFiltersFromUrl();
        $scope.loadDocuments();
      };

      $scope.loadDocuments = function () {

        var
          filter = {};

        if ($scope.searchType.advanced) {
          try {
            filter = filterTools.getAdvancedFilter();
          }
          catch (e) {
            $scope.error = 'The filter JSON is not valid.';
            return false;
          }
        }
        else {
          filter = filterTools.getBasicFilter();

          if (!filter) {
            return false;
          }
        }

        $scope.error = null;

        console.log(filter);
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

      $scope.addTerm = function () {
        $scope.filter.terms.push({field: null, equal: $scope.comparators[0], value: null});
      };

      $scope.removeTerm = function (index) {
        if (index === $scope.filter.terms.length-1) {
          $scope.filter.terms[index].field = null;
          $scope.filter.terms[index].equal = $scope.comparators[0];
          $scope.filter.terms[index].value = null;
          return false;
        }

        $scope.filter.terms.splice(index, 1);
      };

      $scope.advancedSearch = function () {
        $scope.currentPage = 1;
        setSearchType(true);

        filterTools.setAdvancedFilterInUrl();
        $scope.loadDocuments();
      };

      $scope.basicSearch = function () {
        $scope.currentPage = 1;
        setSearchType(false);

        filterTools.setBasicFilterInUrl();
        $scope.loadDocuments();
      };

      $scope.resetAdvancedFilter = function () {
        $scope.error = null;
        $scope.filter.json = '';
      };

      $scope.editDocument = function (index) {
        $scope.documents[index].json = $filter('json')($scope.documents[index].body);
        $scope.documents[index].isEdit = true;
      };

      $scope.saveEditDocument = function (index) {
        try {
          $scope.documents[index].body = JSON.parse($scope.documents[index].json);
          $scope.documents[index].isEdit = false;

          documentApi.update($scope.collection, $scope.documents[index], true);
        }
        catch (e) {
          console.error(e);
        }
      };

      $scope.cancelEditDocument = function (index) {
        $scope.documents[index].isEdit = false;
      };

      $scope.delete = function (index) {

        documentApi.deleteById($stateParams.collection, $scope.documents[index]._id, true)
          .then(function (response) {
            if (!response.data.error) {
              $scope.documents[index].isDeleted = true;

              $timeout(function () {
                if (!bufferCancel.isCanceled('deleteById', $stateParams.collection, $scope.documents[index]._id)) {
                  $scope.documents.splice(index, 1);
                }

                bufferCancel.clean('deleteById', $stateParams.collection, $scope.documents[index]._id);
              }, 3000)
            }
          });
      };

      $scope.cancelDelete = function (index) {
        documentApi.cancelDeleteById($stateParams.collection, $scope.documents[index]._id)
          .then(function (response) {

            if (!response.data.error) {
              $scope.documents[index].isDeleted = false;
            }
          })
      };

      /** PRIVATE METHODS **/
      var filterTools = {
        getFiltersFromUrl: function () {
          if ($stateParams.basicFilter) {
            try {
              $scope.filter.terms = JSON.parse(decodeURIComponent($stateParams.basicFilter));
            }
            catch (e) {
              $state.go('storage.browse.documents', {basicFilter: null}, {reload: false});
            }
            setSearchType(false);
          }
          else if ($stateParams.advancedFilter) {
            $scope.filter.json = decodeURIComponent($stateParams.advancedFilter);
            setSearchType(true);
          }
        },
        setBasicFilterInUrl: function () {
          var filter = decodeURIComponent(JSON.stringify($scope.filter.terms));
          $state.go('storage.browse.documents', {basicFilter: filter, advancedFilter: null}, {reload: false});
        },
        setAdvancedFilterInUrl: function () {
          var filter = decodeURIComponent($scope.filter.json);
          $state.go('storage.browse.documents', {advancedFilter: filter, basicFilter: null}, {reload: false});
        },


        getAdvancedFilter: function () {
          if ($scope.filter.json === '') {
            return {};
          }

          return JSON.parse($scope.filter.json);
        },
        getBasicFilter: function () {
          var
            terms = [],
            formattedTerm = {},
            length = $scope.filter.terms.length,
            error = false;

          $scope.filter.terms.forEach(function (term) {
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
              terms.push(formattedTerm);
            }
            else {
              formattedTerm = {not: {term: {}}};
              formattedTerm.not.term[term.field] = term.value;
              terms.push(formattedTerm);
            }
          });

          if (error) {
            return false;
          }

          if (terms.length === 0) {
            return {};
          }

          return {filter: {and: terms}};
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

      var getSchema = function () {
        schema.get($scope.collection)
          .then(function (response) {
            if (response.error) {
              console.error(response.message);
              return false;
            }

            angular.forEach(response.data.mapping, function (value, key) {
              $scope.fields.push(key);
            });
          });
      };
  }]);