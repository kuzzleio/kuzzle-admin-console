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

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            return accumulator || typeof role.content.indexes._canCreate === 'undefined' || role.content.indexes._canCreate;
          }, false);
        },
        hasRightsOnIndex: function (index) {
          if (!index) {
            throw new Error('[hasRightsOnIndex] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            var roleIndexes;
            if (!role.content || !role.content.indexes) {
              return accumulator;
            }
            roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              return true;
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              return true;
            } else {
              return accumulator;
            }
          }, false);
        },
        canCreateCollection: function (index) {
          if (!index) {
            throw new Error('[canCreateCollection] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            var roleIndexes;
            if (!role.content || !role.content.indexes) {
              return accumulator;
            }
            roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              return accumulator ||
                typeof roleIndexes[index].collections === 'undefined' ||
                typeof roleIndexes[index].collections._canCreate === 'undefined' ||
                !!roleIndexes[index].collections._canCreate;
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              return accumulator ||
                typeof roleIndexes['*'].collections === 'undefined' ||
                typeof roleIndexes['*'].collections._canCreate === 'undefined' ||
                !!roleIndexes['*'].collections._canCreate;
            } else {
              return accumulator;
            }
          }, false);
        },
        canDeleteIndex: function (index) {
          if (!index) {
            throw new Error('[canDeleteIndex] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            var roleIndexes;
            if (!role.content || !role.content.indexes) {
              return accumulator;
            }
            roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              return accumulator ||
                typeof roleIndexes[index]._canDelete === 'undefined' ||
                !!roleIndexes[index]._canDelete;
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              return accumulator ||
                typeof roleIndexes['*']._canDelete === 'undefined' ||
                !!roleIndexes['*']._canDelete;
            } else {
              return accumulator;
            }
          }, false);
        },
        canDeleteCollection: function (index, collection) {
          if (!index || !collection) {
            throw new Error('[canDeleteCollection] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            var
              roleIndexes,
              currentIndex;
            if (!role.content || !role.content.indexes) {
              return accumulator;
            }
            roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              currentIndex = roleIndexes[index];
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              currentIndex = roleIndexes['*'];
            } else {
              return accumulator;
            }

            if (!currentIndex.collections) {
              return accumulator;
            } else if (currentIndex.collections[collection]) {
              return accumulator ||
                typeof currentIndex.collections[collection]._canDelete === 'undefined' ||
                currentIndex.collections[collection]._canDelete;
            } else if (currentIndex.collections['*']) {
              return accumulator ||
                typeof currentIndex.collections['*']._canDelete === 'undefined' ||
                currentIndex.collections['*']._canDelete;
            } else {
              return accumulator;
            }
          }, false);
        },
        canDoAction: function (index, collection, controller, action) {
          if (!index) {
            throw new TypeError('[canDoAction] Missing index');
          }
          if (!collection) {
            throw new TypeError('[canDoAction] Missing collection');
          }
          if (!controller) {
            throw new TypeError('[canDoAction] Missing controller');
          }
          if (!action) {
            throw new TypeError('[canDoAction] Missing action');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            var
              roleIndexes,
              currentIndex,
              currentCollection,
              currentController;
            if (!role.content || !role.content.indexes) {
              return accumulator;
            }
            roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              currentIndex = roleIndexes[index];
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              currentIndex = roleIndexes['*'];
            } else {
              return accumulator;
            }

            if (!currentIndex.collections) {
              return accumulator;
            } else if (currentIndex.collections[collection]) {
              currentCollection = currentIndex.collections[collection];
            } else if (currentIndex.collections['*']) {
              currentCollection = currentIndex.collections['*'];
            } else {
              return accumulator;
            }

            if (!currentCollection.controllers) {
              return accumulator;
            } else if (currentCollection.controllers[controller]) {
              currentController = currentCollection.controllers[controller];
            } else if (currentCollection.controllers['*']) {
              currentController = currentCollection.controllers['*'];
            } else {
              return accumulator;
            }

            if (!currentController.actions) {
              return accumulator;
            } else if (currentController.actions[action]) {
              return accumulator || currentController.actions[action];
            } else if (currentController.actions['*']) {
              return accumulator || currentController.actions['*'];
            } else {
              return accumulator;
            }
          }, false);
        }
      };
    }]);
