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
            return accumulator || !!role.content.indexes._canCreate;
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
            var roleIndexes = role.content.indexes;

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
            var roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              return roleIndexes[index].collections._canCreate;
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              return roleIndexes['*'].collections._canCreate;
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
            var roleIndexes = role.content.indexes;
            if (roleIndexes[index]) {
              return roleIndexes[index]._canDelete;
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              return roleIndexes['*']._canDelete;
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
            var roleIndexes = role.content.indexes,
              currentIndex;

            if (roleIndexes[index]) {
              currentIndex = roleIndexes[index];
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              currentIndex = roleIndexes['*'];
            } else {
              return accumulator;
            }

            if (currentIndex.collections[collection]) {
              return accumulator || currentIndex.collections[collection]._canDelete;
            } else if (currentIndex.collections['*']) {
              return accumulator || currentIndex.collections['*'];
            } else {
              return accumulator;
            }
          }, false);
        },
        canDoAction: function (index, collection, controller, action) {
          var
            roleIndexes,
            currentIndex,
            currentCollection,
            currentController;
          if (!index || !collection || !controller || !action) {
            throw new Error('[canDeleteCollection] Missing argument');
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return session.user.content.profile.content.roles.reduce(function (accumulator, role) {
            roleIndexes = role.content.indexes;

            if (roleIndexes[index]) {
              currentIndex = roleIndexes[index];
            } else if (index !== kuzzleCoreIndex && roleIndexes['*']) {
              currentIndex = roleIndexes['*'];
            } else {
              return accumulator;
            }

            if (currentIndex.collections[collection]) {
              currentCollection = currentIndex.collections[collection];
            } else if (currentIndex.collections['*']) {
              currentCollection = currentIndex.collections['*'];
            } else {
              return accumulator;
            }

            if (currentCollection.controllers[controller]) {
              currentController = currentCollection.controllers[controller];
            } else if (currentCollection.controllers['*']) {
              currentController = currentCollection.controllers['*'];
            } else {
              return accumulator;
            }
            if (currentController.actions[action]) {
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
