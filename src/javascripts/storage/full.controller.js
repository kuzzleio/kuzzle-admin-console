require('./addAttribute/addAttribute.directive');
require('./leaflet.directive');

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
    'authorizationApi',
    function ($scope, $http, documentApi, $stateParams, $state, notification, schema, previousState, $window, authorization) {

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
      $scope.option = {
        another: false
      };

      // Document itself. Loaded from server if we are in edition
      $scope.document = {id: $stateParams.id, content: {}, json: null};

      var
        message = null;

      /**
       * Call on DOM init.
       * This function will get the document by _id if we are in edition
       * Prepare the schema according to data set in document
       * Subscribe to the document modification for displaying a message if someone else edit/delete this document
       */
      $scope.init = function () {
        $scope.canEditDocument = authorization.canDoAction($stateParams.index, $scope.collection, 'write', 'createOrReplace');
        schema.buildFormatter($stateParams.collection)
          .then(function (schema) {
            $scope.schema = schema;
            $scope.schema.readonly = !$scope.canEditDocument;

            if ($stateParams.id) {
              $scope.isEdit = true;
              $scope.exists = true;

              documentApi.getById($stateParams.collection, $stateParams.id)
                .then(function (response) {
                  $scope.document.json = angular.toJson(response.document.content, 4);

                  $scope.document.id = response.document.id;

                  // use refreshFormWithJson instead of directly put data in body because the field order is different in mapping and in document itself
                  // if we don't do that, when the user switch between json/form view, fields order can move
                  refreshFormWithJson();
                  documentApi.subscribeId($stateParams.collection, $stateParams.id, function () {
                    message = notification.info({
                      message:'Someone just updated this document',
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
          });

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
          })
          .catch(function () {
            // If there is no document matching the id
            $scope.isLoading = false;
          });
      };

      /**
       * Triggered when user click on Create button.
       * The document is persisted to Kuzzle. If `$scope.option.another` is set to true, the form is reloaded
       */
      $scope.create = function () {
        var document = getDocumentBody();

        if (!document) {
          return false;
        }

        documentApi.create($scope.collection, $scope.document.id, document, true)
          .then(function (response) {
            if ($scope.option.another) {
              $state.reload();
            }

            $scope.document.id = response.id;
            $scope.exists = true;
          })
          .catch(function (error) {
            console.error(error);
          });
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

        $state.go('storage.browse.documents', {index: $stateParams.index, collection: $stateParams.collection}, {reload: false});
      };

      /**
       * Triggered on click on button on top of the form
       */
      $scope.switchView = function (view) {
        if (view === 'json') {
          $scope.document.json = angular.toJson($scope.document.content, 4);
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
       * Refresh the form and display new fields
       */
      $scope.refreshForm = function () {
        $scope.$broadcast('schemaFormRedraw');
      };

      /**
       * When an another user edit the same document, a notification is displayed and the user can click on it for reload the document
       */
      $scope.refresh = function () {
        $state.reload();
        message.then(function (notificationScope) {
          notificationScope.kill(true);
        });
      };

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
          document = $scope.document.content;
        }

        return document;
      };

      /**
       * Parse the text in json and transform into a form
       */
      var refreshFormWithJson = function () {
        var schema;

        $scope.document.content = JSON.parse($scope.document.json);
        schema = getUpdatedSchema($scope.document, 'content');
        $scope.schema = angular.merge(schema, $scope.schema);
        $scope.$broadcast('schemaFormRedraw');
      };
    }]);
