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
          var userProfile = session.user.content.profile;

          if (!hasUser(session.user) || !hasRole(session.user)) {
            return false;
          }

          return userProfile.content.roles.reduce(function(accumulator, role) {
            return accumulator || !!role.content.indexes._canCreate;
          }, false);
        },
        canCreateCollection: function (index) {

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