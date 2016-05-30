require('./session.service');
angular.module('kuzzle.authorization', [])
  .service('authorizationApi', [
    'Session',
    'kuzzleCoreIndex',
    function (session, kuzzleCoreIndex) {

      return {
        canCreateIndex: function () {
          return true;
        },
        hasRightsOnIndex: function (index) {
          return true;
        },
        canCreateCollection: function (index) {
          return true;
        },
        canDeleteIndex: function (index) {
          return true;
        },
        canDoAction: function (index, collection, controller, action) {
          return true;
        }
      };
    }]);
