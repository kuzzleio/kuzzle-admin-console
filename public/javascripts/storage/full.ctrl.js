angular.module('kuzzle.storage')

  /** This controller is used on a document full view: for edit or create a document **/
  .controller('StorageFullCtrl', [
    '$scope',
    '$http',
    'documentApi',
    '$stateParams',
    '$state',
    'Notification',
    'schema',
    'previousState',
    '$window',
    '$uibModal',
    function ($scope, $http, documentApi, $stateParams, $state, notification, schema, previousState, $window, $uibModal) {

      // Define the schema collection. Allow to display a JSON representation into a form
      $scope.schema = {};
      // List of all flatten attributes. Useful for display a list of nested attributes
      $scope.listAttributes = [];
      // The document collection
      $scope.collection = $stateParams.collection;
      // The view type. Can be 'form' or 'json'. The 'json' view display the document as a JSON object
      $scope.view = 'form';

      // Define if the user is in a 'edit' or a 'create' view
      $scope.isEdit = false;
      // Define if the document already exists. Can be updated when the user type an already existing _id in form
      $scope.exists = false;
      // Set to true during the document get by _id when the user enter an _id in form
      $scope.isLoading = false;

      // Checkbox on form. If is set to true, when the user click on 'create', the document is created and the form is reinitialized.
      $scope.another = false;

      // Mock creation of a new field
      $scope.newField = {name: null, type: null, after: null};

      // Document itself. Loaded from server if we are in edition
      $scope.document = {id: $stateParams.id, body: null, json: null};

      $scope.error = {
        addAttribute: false
      };

      var
        message = null,
        modal;

      /**
       * Call on DOM init.
       * This function will get the document by _id if we are in edition
       * Prepare the schema according to data set in document
       * Subscribe to the document modification for displaying a message if someone else edit/delete this document
       *
       * @param action Can be 'edit' or 'create'
       */
      $scope.init = function (action) {

        schema.buildFormatter($stateParams.collection)
          .then(function (schema) {
            $scope.schema = schema;
          });

        if (action === 'edit') {
          $scope.isEdit = true;
          $scope.exists = true;

          documentApi.getById($stateParams.collection, $stateParams.id)
            .then(function (response) {
              $scope.document.json = angular.toJson(response.document.content, 4);

              // use refreshFormWithJson instead of directly put data in body because the field order is different in mapping and in document itself
              // if we don't do that, when the user switch between json/form view, fields order can move
              refreshFormWithJson();
              $scope.document.id = response.document.id;

              documentApi.subscribeId($stateParams.collection, $stateParams.id, function () {
                message = notification.info({
                  message:'Someone has update this document',
                  templateUrl: 'refreshTemplate.html',
                  delay: null,
                  scope: $scope,
                  closeOnClick: false
                });
              });
            })
            .catch(function (error) {
              $scope.notFoundError = true;
              console.error(error);
              return false;
            });
        }
      };

      /**
       * This function is triggered on field _id blur.
       * Get from server and check if document already exists. If the document exists, we'll change `$scope.exists` to true
       */
      $scope.documentExists = function () {

        $scope.exists = false;

        if (!$scope.document.id || $scope.document.id === '') {
          return false;
        }

        $scope.isLoading = true;
        documentApi.getById($stateParams.collection, $scope.document.id)
          .then(function (response) {
            $scope.isLoading = false;

            if (response.data && response.data.document) {
              $scope.exists = true;
              return false;
            }

            $scope.exists = false;
          });
      };

      /**
       * Triggered when user click on Create button.
       * The document is persisted to Kuzzle. If `$scope.another` is set to true, the form is reloaded
       */
      $scope.create = function () {
        var document = getDocumentBody();

        if (!document) {
          return false;
        }

        documentApi.create($scope.collection, document, true)
          .then(function (response) {
            if ($scope.another) {
              $state.reload();
            }

            $scope.document.id = response.id;
            $scope.exists = true;
          })
          .catch(function (error) {
            console.error(error);
          })
      };

      /**
       * Triggered when user click on Update button
       */
      $scope.update = function () {
        var document = getDocumentBody();

        if (!document) {
          return false;
        }

        documentApi.update($stateParams.collection, $scope.document.id, document, true);
      };

      /**
       * Triggered when user click on "List" action.
       * If the user previously come to the list we simply do an history back. If not, we redirect the user on the list of the document's collection
       * @returns {boolean}
       */
      $scope.goToList = function () {
        var previous = previousState.get();

        if (previous && previous.name === 'storage.browse.documents') {
          $window.history.back();
          return false;
        }

        $state.go('storage.browse.documents', {collection: $stateParams.collection}, {reload: false});
      };

      /**
       * Triggered on click on button on top of the form
       */
      $scope.switchView = function (view) {
        if (view === 'json') {
          $scope.document.json = angular.toJson($scope.document.body, 4);
        }
        else {
          try {
            refreshFormWithJson();
          }
          catch (e) {

          }
        }

        $scope.view = view;
      };

      /**
       * When an another user edit the same document, a notification is displayed and the user can click on it for reload the document
       */
      $scope.refresh = function () {
        $state.reload();
        message.then(function (notificationScope) {
          notificationScope.kill(true);
        })
      };

      /**
       * Triggered when the user click on "Add Attribute". Will display a modal for adding a new attribute
       */
      $scope.openModalAddAttribute = function () {
        modal = $uibModal.open({
          templateUrl: 'modalAddAttribute.html',
          scope: $scope
        })
      };

      $scope.cancelModal = function () {
        modal.dismiss('cancel');
        $scope.newField = {name: null, type: null, after: null};
      };

      $scope.addAttribute = function () {
        $scope.error.addAttribute = false;

        if (!$scope.newField || !$scope.newField.name || !$scope.newField.type) {
          $scope.error.addAttribute = true;
          return false;
        }

        $scope.schema.properties[$scope.newField.name] = {};
        $scope.schema.properties[$scope.newField.name].type = $scope.newField.type;

        if (!$scope.document.body) {
          $scope.document.body = {};
        }

        switch ($scope.newField.type) {
          case 'string':
            $scope.document.body[$scope.newField.name] = '';
            break;
          case 'object':
            $scope.document.body[$scope.newField.name] = {};
            $scope.schema.properties[$scope.newField.name].properties = {};
            break;
          case 'location':
            $scope.schema.properties[$scope.newField.name].type = 'object';
            $scope.document.body[$scope.newField.name] = {lat: 0, lon: 0};
            $scope.schema.properties[$scope.newField.name].properties = {
              lat : {
                type: 'number'
              },
              lon: {
                type: 'number'
              }
            };
            break;
          case 'number':
            $scope.document.body[$scope.newField.name] = 0;
            break;
        }

        $scope.document.json = angular.toJson($scope.document.body, 4);

        modal.dismiss('cancel');

        $scope.newField = {name: null, type: null, after: null};
      };

      /** WATCHERS **/

      $scope.$watch('schema', function () {
        if (!$scope.schema || !$scope.schema.properties) {
          return false;
        }

        $scope.listAttributes = getFlattenAttributes($scope.schema.properties, '');
      }, true);


      /** PRIVATE **/

      /**
       * Update the schema according to the document itself
       * @param document
       * @param propertyName
       * @returns {*}
       */
      var getUpdatedSchema = function (document, propertyName) {
        var
          schema = {},
          type = typeof document[propertyName],
          properties = {},
          property;

        if (type === 'object') {
          if (!document[propertyName]) {
            return false;
          }

          angular.forEach(document[propertyName], function (value, subProperty) {
            property = getUpdatedSchema(document[propertyName], subProperty);

            if (!property) {
              return false;
            }

            properties[subProperty] = property;
          });

          schema = {
            type: 'object',
            properties: properties
          };
        }
        else {
          schema = {
            type: type
          };
        }

        return schema;
      };

      /**
       * Get the document body according to the current view ('json' or 'form')
       * @returns {*}
       */
      var getDocumentBody = function () {
        var document;

        if ($scope.view === 'json') {
          try {
            document = JSON.parse($scope.document.json);
          }
          catch (e) {
            notification.error('Error parsing document.');
            return false;
          }
        }
        else {
          document = $scope.document.body;
        }

        return document
      };

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
            attributes = attributes.concat(getFlattenAttributes(property.properties, prefix + name + '.'));
          }
          else {
            attributes.push(prefix + name);
          }
        });

        return attributes;
      };

      /**
       * Parse the text in json and transform into a form
       */
      var refreshFormWithJson = function () {
        $scope.document.body = JSON.parse($scope.document.json);
        $scope.schema = getUpdatedSchema($scope.document, 'body');
        $scope.$broadcast('schemaFormRedraw');
      };
    }]);