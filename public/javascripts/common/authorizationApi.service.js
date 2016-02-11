angular.module('kuzzle.authorization', ['ui-notification', 'kuzzle.kuzzleSdk'])
  .service('autorizationApi', [
    'Session',
    'kuzzleCoreIndex',
    function (session, kuzzleCoreIndex) {
      return {
        canReadIndex: function (index) {
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
