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
          label: 'is equal to',
          value: true
        },
        {
          label: 'is not equal to',
          value: false
        }
      ];
      $scope.filter = {
        basicFilter: {
          or: [
            {
              and: [
                {field: null, equal: $scope.comparators[0], value: null}
              ]
            }
          ]
        },
        advancedFilter: ''
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

      $scope.addAndTerm = function (index) {
        $scope.filter.basicFilter.or[index].and.push({field: null, equal: $scope.comparators[0], value: null});
      };

      $scope.addOr = function () {
        $scope.filter.basicFilter.or.push({
          and: [
            {field: null, equal: $scope.comparators[0], value: null}
          ]
        });
      };

      $scope.removeTerm = function (groupIndex, termIndex) {

        if ($scope.filter.basicFilter.or.length === 1 && $scope.filter.basicFilter.or[0].and.length ===1) {
          $scope.filter.basicFilter.or[0].and[0].field = null;
          $scope.filter.basicFilter.or[0].and[0].equal = $scope.comparators[0];
          $scope.filter.basicFilter.or[0].and[0].value = null;
          return false;
        }

        $scope.filter.basicFilter.or[groupIndex].and.splice(termIndex, 1);
        if ($scope.filter.basicFilter.or[groupIndex].and.length === 0) {
          $scope.filter.basicFilter.or.splice(groupIndex, 1);
        }
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
        $scope.filter.advancedFilter = '';
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
              }, bufferCancel.timer)
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
          var filter = [];

          if ($stateParams.basicFilter) {
            try {
              filter = JSON.parse(decodeURIComponent($stateParams.basicFilter));
            }
            catch (e) {
              $state.go('storage.browse.documents', {basicFilter: null}, {reload: false});
              return false;
            }

            if (!filter.or) {
              $state.go('storage.browse.documents', {basicFilter: null}, {reload: false});
              return false;
            }

            filter.or = filter.or.map(function (group) {
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

            $scope.filter.basicFilter = filter;
            setSearchType(false);
          }
          else if ($stateParams.advancedFilter) {
            $scope.filter.advancedFilter = decodeURIComponent($stateParams.advancedFilter);
            setSearchType(true);
          }
          else {
            setSearchType(false);
          }

        },
        setBasicFilterInUrl: function () {
          var filter = null;

          if (Object.keys(this.formatBasicFilter()).length !== 0) {
            filter = decodeURIComponent(angular.toJson($scope.filter.basicFilter));
          }
          $state.go('storage.browse.documents', {basicFilter: filter, advancedFilter: null}, {reload: false});
        },
        setAdvancedFilterInUrl: function () {
          var filter = decodeURIComponent($scope.filter.advancedFilter);
          $state.go('storage.browse.documents', {advancedFilter: filter, basicFilter: null}, {reload: false});
        },


        formatAdvancedFilter: function () {
          if ($scope.filter.advancedFilter === '') {
            return {};
          }

          return JSON.parse($scope.filter.advancedFilter);
        },
        formatBasicFilter: function () {
          var
            or = [],
            and = [],
            formattedTerm = {},
            length = $scope.filter.basicFilter.or.length,
            error = false;

          $scope.filter.basicFilter.or.forEach(function (group) {

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