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
    function ($scope, $http, $stateParams, schema, $filter, documentApi) {

      $scope.collection = $stateParams.collection;

      $scope.documents = [];
      $scope.error = null;

      $scope.searchType = 'basic';
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
        $scope.loadDocuments();
      };

      $scope.loadDocuments = function () {

        var
          filter = {};

        if ($scope.searchType === 'advanced') {
          try {
            filter = getAdvancedFilter();
          }
          catch (e) {
            $scope.error = 'The filter JSON is not valid.';
            return false;
          }
        }
        else {
          filter = getBasicFilter();

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

      $scope.addTerm = function () {
        $scope.filter.terms.push({field: null, equal: $scope.comparators[0], value: null});
      };

      $scope.removeTerm = function (index) {
        if (index === $scope.filter.terms.length -1) {
          $scope.filter.terms[index] = {field: null, equal: $scope.comparators[0], value: null};
          return false;
        }

        $scope.filter.terms.splice(index, 1);
      };

      $scope.advancedSearch = function () {
        $scope.currentPage = 1;
        $scope.searchType = 'advanced';
        $scope.loadDocuments();
      };

      $scope.basicSearch = function () {
        $scope.currentPage = 1;
        $scope.searchType = 'basic';

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

        }
      };

      $scope.cancelEditDocument = function (index) {
        $scope.documents[index].isEdit = false;
      };

      /** PRIVATE METHODS **/
      var getAdvancedFilter = function () {
        if ($scope.filter.json === '') {
          return {};
        }

        return JSON.parse($scope.filter.json);
      };

      var getBasicFilter = function () {
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