angular.module('kuzzle.authorization', [])
  .service('authorizationApi', [
    'Session',
    'kuzzleCoreIndex',
    function (session, kuzzleCoreIndex) {
      var hasRole = function (user) {
        return Array.isArray(user.content.profile.content.roles);
      };

      var hasUser = function (user) {
        return session.user.id;
      };

      return {
        canReadIndex: function (index) {
          var userProfile = session.user.content.profile;
          if (!index) {
            throw '[canReadIndex] Missing argument';
          }

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return userProfile.content.roles.reduce(function(accumulator, role) {
            var roleIndexes = role.content.indexes;
            var roleHasIndexRead = Object.keys(roleIndexes).reduce(function(indexAccumulator, indexIdentifier) {
              if ((index === indexIdentifier || indexIdentifier === '*' && index !== kuzzleCoreIndex)) {

                return indexAccumulator || !!roleIndexes[indexIdentifier]._canRead;
              }
              return indexAccumulator;
            },false);

            return accumulator || !!roleHasIndexRead;
          }, false);
        },
        canReadCollection: function (index, collection) {
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
content.roles[...].content.indexes[...].canRead
content.roles[...].content.indexes[...].canDelete
content.roles[...].content.indexes[...].collections[...].controllers[...].actions[...]
*/