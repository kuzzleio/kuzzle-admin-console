angular.module('kuzzle.authorization', [])
  .service('authorizationApi', [
    'Session',
    'kuzzleCoreIndex',
    function (session, kuzzleCoreIndex) {
      var hasRole = function (user) {
        return Array.isArray(user.content.profile.content.roles);
      };

      var hasUser = function (user) {
        return !!user.id;
      };

      return {
        canCreateIndex: function () {
          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function(accumulator, role) {
            return accumulator || !!role.content.indexes._canCreate;
          }, false);
        },
        canCreateCollection: function (index) {
          if (!index) {
            throw new Error('[canCreateCollection] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function(accumulator, role) {
            var roleIndexes = role.content.indexes;
            var roleHasCollectionCreate = Object.keys(roleIndexes).reduce(function (indexAccumulator, indexIdentifier) {
              if ((index === indexIdentifier ||
                indexIdentifier === '*' &&
                index !== kuzzleCoreIndex) &&
                indexIdentifier.charAt(0) !== '_'
              ) {
                return indexAccumulator || !!roleIndexes[indexIdentifier].collections._canCreate;
              }
              return indexAccumulator;
            }, false);

            return accumulator || roleHasCollectionCreate;
          }, false);
        },
        canDeleteIndex: function (index) {
          if (!index) {
            throw new Error('[canDeleteIndex] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function(accumulator, role) {
            var roleIndexes = role.content.indexes;
            var roleHasCollectionCreate = Object.keys(roleIndexes).reduce(function (indexAccumulator, indexIdentifier) {
              var roleIndex = roleIndexes[indexIdentifier];
              if ((index === indexIdentifier ||
                indexIdentifier === '*' &&
                index !== kuzzleCoreIndex) &&
                indexIdentifier.charAt(0) !== '_'
              ) {
                return indexAccumulator || !!roleIndex._canDelete;
              }
              return indexAccumulator;
            }, false);

            return accumulator || roleHasCollectionCreate;
          }, false);
        },
        canDeleteCollection: function (index, collection) {
          if (!index || !collection) {
            throw new Error('[canDeleteCollection] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function(accumulator, role) {
            var roleIndexes = role.content.indexes;
            var roleHasCollectionCreate = Object.keys(roleIndexes).reduce(function (indexAccumulator, indexIdentifier) {
              var roleIndex = roleIndexes[indexIdentifier];
              if ((index === indexIdentifier ||
                indexIdentifier === '*' &&
                index !== kuzzleCoreIndex) &&
                indexIdentifier.charAt(0) !== '_'
              ) {
                var hasCollectionDelete = Object.keys(roleIndex.collections).reduce(function (collectionAccumulator, collectionIdentifier) {
                  if (collection === collectionIdentifier || collectionIdentifier === '*') {
                    return collectionAccumulator || !!roleIndex.collections[collectionIdentifier]._canDelete;
                  }
                  return collectionAccumulator;
                }, false);

                return indexAccumulator || hasCollectionDelete;
              }
              return indexAccumulator;
            }, false);

            return accumulator || roleHasCollectionCreate;
          }, false);
        },
        canDoAction: function (index, collection, controller, action) {
          if (!index || !collection || !controller || !action) {
            throw new Error('[canDeleteCollection] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function(accumulator, role) {
            var roleIndexes = role.content.indexes;
            var roleHasCollectionCreate = Object.keys(roleIndexes).reduce(function (indexAccumulator, indexIdentifier) {
              var roleIndex = roleIndexes[indexIdentifier];
              if ((index === indexIdentifier ||
                indexIdentifier === '*' &&
                index !== kuzzleCoreIndex) &&
                indexIdentifier.charAt(0) !== '_'
              ) {
                var hasCollectionRight = Object.keys(roleIndex.collections).reduce(function (collectionAccumulator, collectionIdentifier) {
                  var currentCollection = roleIndex.collections[collectionIdentifier];
                  if ((collection === collectionIdentifier ||
                    collectionIdentifier === '*') &&
                    collectionIdentifier.charAt(0) !== '_'
                  ) {
                    var hasControllerRight = Object.keys(currentCollection.controllers).reduce(function (controllerAccumulator, controllerIdentifier) {
                      var currentController = currentCollection.controllers[controllerIdentifier];
                      if (controller === controllerIdentifier || controllerIdentifier === '*') {
                        var hasActionRight = Object.keys(currentController.actions).reduce(function (actionAccumulator, actionIdentifier) {
                          if ((action === actionIdentifier || actionIdentifier === '*')) {
                            if (typeof currentController.actions[actionIdentifier] === 'function') {
                              return true;
                            }
                            return actionAccumulator || !!currentController.actions[actionIdentifier];
                          }
                          return controllerAccumulator;
                        }, false);
                        return controllerAccumulator || !!hasActionRight;
                      }
                      return controllerAccumulator;
                    }, false);
                    return collectionAccumulator || hasControllerRight;
                  }
                  return collectionAccumulator;
                }, false);
                return indexAccumulator || hasCollectionRight;
              }
              return indexAccumulator;
            }, false);
            return accumulator || roleHasCollectionCreate;
          }, false);
        }
      };
    }]);

/*
content.roles[...].content.indexes[...].collections[...].controllers[...].actions[...]
*/