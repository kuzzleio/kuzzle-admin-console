angular.module('kuzzle.addAttribute', ['ui.bootstrap'])

  .controller('AddAttributeCtrl', ['$scope', '$uibModal', function ($scope, $uibModal) {
    var
      NEW_FIELD_MOCK = {name: null, type: null, after: null},
      ROOT_DOCUMENT_LABEL = 'Root document',
      modal;

    $scope.error = false;
    // Mock creation of a new field
    $scope.newField = angular.copy(NEW_FIELD_MOCK);

    /**
     * Triggered when the user click on "Add Attribute". Will display a modal for adding a new attribute
     */
    $scope.openModalAddAttribute = function () {
      modal = $uibModal.open({
        templateUrl: 'javascripts/storage/addAttribute/addAttributeModal.tpl.html',
        scope: $scope
      });
    };

    $scope.cancelModal = function () {
      modal.dismiss('cancel');
      $scope.newField = angular.copy(NEW_FIELD_MOCK);
    };

    $scope.addAttribute = function () {
      var
        nestedProperties,
        nestedBody;

      $scope.error = false;

      if (!$scope.newField || !$scope.newField.name || !$scope.newField.type) {
        $scope.error = true;
        return false;
      }

      nestedProperties = getNestedProperties($scope.schema.properties, $scope.newField.after);
      nestedBody = getNestedBody($scope.document.content, $scope.newField.after);

      nestedProperties[$scope.newField.name] = {};
      nestedProperties[$scope.newField.name].type = $scope.newField.type;

      if (!$scope.document.content) {
        $scope.document.content = {};
      }

      switch ($scope.newField.type) {
        case 'string':
          nestedBody[$scope.newField.name] = '';
          break;
        case 'object':
          nestedBody[$scope.newField.name] = {};
          nestedProperties[$scope.newField.name].properties = {};
          break;
        case 'location':
          nestedBody[$scope.newField.name] = {lat: 0, lon: 0};
          nestedProperties[$scope.newField.name].type = 'object';
          nestedProperties[$scope.newField.name].properties = {
            lat : {
              type: 'number'
            },
            lon: {
              type: 'number'
            }
          };
          break;
        case 'number':
          nestedBody[$scope.newField.name] = 0;
          break;
      }

      $scope.document.json = angular.toJson($scope.document.content, 4);
      $scope.refreshForm();

      modal.dismiss('cancel');
      $scope.newField = angular.copy(NEW_FIELD_MOCK);
    };

    /** WATCHERS **/
    $scope.$watch('schema', function () {
      if (!$scope.schema || !$scope.schema.properties) {
        return false;
      }

      $scope.listAttributes = [ROOT_DOCUMENT_LABEL].concat(getFlattenAttributes($scope.schema.properties, ''));
    }, true);

    /** PRIVATE **/

    /**
     * Flat all document attributes in an array
     *
     * @param properties
     * @param prefix
     * @returns {Array}
     */
    var getFlattenAttributes = function (properties, prefix) {
      var
        attributes = [];

      angular.forEach(properties, function (property, name) {
        if (property.properties) {
          attributes.push(prefix + name);
          attributes = attributes.concat(getFlattenAttributes(property.properties, prefix + name + '.'));
        }
      });

      return attributes;
    };

    var getNestedProperties = function (properties, path) {
      var
        paths,
        current = properties,
        i;

      if (!path || path === ROOT_DOCUMENT_LABEL) {
        return properties;
      }

      paths = path.split('.');

      for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]].properties === undefined) {
          return current[paths[i]];
        }
        else {
          current = current[paths[i]].properties;
        }
      }

      return current;
    };

    var getNestedBody = function (attributes, path) {
      var
        paths,
        current = attributes,
        i;

      if (!path || path === ROOT_DOCUMENT_LABEL) {
        return attributes;
      }

      paths = path.split('.');

      for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
          return current[paths[i]];
        }
        else {
          current = current[paths[i]];
        }
      }

      return current;
    };
  }])

  .directive('addAttribute', [function () {
    return {
      restrict: 'E',
      scope: {
        schema: '=',
        document: '=',
        refreshForm: '&'
      },
      templateUrl: 'javascripts/storage/addAttribute/addAttribute.tpl.html',
      controller: 'AddAttributeCtrl'
    };
  }]);