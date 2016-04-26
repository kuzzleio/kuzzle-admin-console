import schemaService from '../schema.service';

export default angular.module('kuzzle.basicFilter', [schemaService])

  .controller('BasicFilterCtrl', ['$scope', 'schema', function ($scope, schema) {
    var count = function() {
      $scope.count = 0;

      angular.forEach($scope.filters, function (value, key) {
        $scope.count += value.and.length;
      });
    };

    $scope.formattedFilter = [];

    $scope.fields = [];
    $scope.count = 0;

    $scope.addAndTerm = function (index) {
      $scope.filters[index].and.push({field: null, equal: $scope.comparators[0], value: null});
      count();
    };

    $scope.addOr = function () {
      $scope.filters.push({
        and: [
          {field: null, equal: $scope.comparators[0], value: null}
        ]
      });
      count();
    };

    $scope.removeTerm = function (groupIndex, termIndex) {

      if ($scope.filters.length === 1 && $scope.filters[0].and.length === 1) {
        $scope.filters[0].and[0].field = null;
        $scope.filters[0].and[0].equal = $scope.comparators[0];
        $scope.filters[0].and[0].value = null;
        return false;
      }

      $scope.filters[groupIndex].and.splice(termIndex, 1);
      if ($scope.filters[groupIndex].and.length === 0) {
        $scope.filters.splice(groupIndex, 1);
      }
      count();
    };

    var getFields = function () {
      if (!$scope.collection) {
        return false;
      }

      schema.get($scope.collection)
        .then(function (response) {
          if (response.error) {
            console.error(response.message);
            return false;
          }

          $scope.fields = parseFields(response.mapping, '');
        });
    };

    var parseFields = function (fields, prefix) {
      var parsedFields = [];

      angular.forEach(fields, function (value, key) {
        parsedFields.push(prefix + key);

        if (value.properties) {
          parsedFields = parsedFields.concat(parseFields(value.properties, key + '.'));
        }
      });

      return parsedFields;
    };

    getFields();
    count();

    /** WATCHERS **/
    $scope.$watch('collection', function () {
      getFields();
    });
  }])

  .directive('basicFilter', function () {
    return {
      restrict: 'E',
      scope: {
        addGroupLabel: '@',
        filters: '=',
        collection: '=',
        comparators: '='
      },
      controller: 'BasicFilterCtrl',
      template: require('./basicFilter.tpl.html')
    };
  })
  .name;
