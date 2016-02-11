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
              if ((index === indexIdentifier || indexIdentifier === '*' && index !== kuzzleCoreIndex)) {

                return indexAccumulator || !!roleIndexes[indexIdentifier].collections._canCreate;
              }
              return indexAccumulator;
            }, false);

            return accumulator || roleHasCollectionCreate;
          }, false);
        },
        canDeleteIndex: function (index) {
        },
        canDeleteCollection: function (index, collection) {
        },
        canUseController: function (index, collection, controller) {
        },
        canDoAction: function (index, collection, controller, action) {


        }
      };
    }]);

/*
content.roles[...].content.indexes.canCreate
content.roles[...].content.indexes[...].canDelete
 content.roles[...].content.indexes[...].collections.canCreate
 content.roles[...].content.indexes[...].collections[...].canDelete
content.roles[...].content.indexes[...].collections[...].controllers[...].actions[...]
*/