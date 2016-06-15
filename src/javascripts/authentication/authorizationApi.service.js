require('./session.service');
angular.module('kuzzle.authorization', [])
  .service('authorizationApi', [
    'Session',
    'kuzzleSdk',
    'kuzzleCoreIndex',
    function (session, kuzzleSdk, kuzzleCoreIndex) {
      return {
        canCreateIndex: function () {
          return this.canDoAction('*', '*', 'admin', 'createIndex');
        },
        canManageRoles: function () {
          return this.canDoAction('*', '*', 'security', 'getRole')
            || this.canDoAction('*', '*', 'security', 'searchRoles')
            || this.canDoAction('*', '*', 'security', 'createOrReplaceRole')
            || this.canDoAction('*', '*', 'security', 'createRole')
            || this.canDoAction('*', '*', 'security', 'deleteRole');
        },
        canManageProfiles: function () {
          return this.canDoAction('*', '*', 'security', 'getProfile')
            || this.canDoAction('*', '*', 'security', 'searchProfiles')
            || this.canDoAction('*', '*', 'security', 'createOrReplaceProfile')
            || this.canDoAction('*', '*', 'security', 'createProfile')
            || this.canDoAction('*', '*', 'security', 'deleteProfile');
        },
        canManageUsers: function () {
          return this.canDoAction('*', '*', 'security', 'getUser')
            || this.canDoAction('*', '*', 'security', 'searchUsers')
            || this.canDoAction('*', '*', 'security', 'createOrReplaceUser')
            || this.canDoAction('*', '*', 'security', 'createUser')
            || this.canDoAction('*', '*', 'security', 'deleteUser');
        },
        hasSecurityRights: function () {
          return this.canManageRoles() || this.canManageProfiles() || this.canManageUsers();
        },
        canCreateCollection: function (index) {
          return this.canDoAction(index, '*', 'write', 'createCollection');
        },
        canDeleteIndex: function (index) {
          return this.canDoAction(index, '*', 'admin', 'deleteIndex');
        },
        canDoAction: function (index, collection, controller, action) {
          var allowed = kuzzleSdk.security.isActionAllowed(session.session.rights, controller, action, index, collection);

          return allowed !== 'denied';
        }
      };
    }]);
