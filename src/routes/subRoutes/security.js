/* istanbul ignore next */

export default {
  '/users': {
    name: 'SecurityUsersList',
    component (resolve) {
      require(['../../components/Security/Users/Browse'], resolve)
    }
  },
  '/profiles': {
    name: 'SecurityProfilesList',
    component (resolve) {
      require(['../../components/Security/Profiles/Browse'], resolve)
    }
  },
  '/profiles/create': {
    name: 'SecurityProfilesCreate',
    component (resolve) {
      require(['../../components/Security/Common/Create'], resolve)
    }
  },
  '/profile/:profileId': {
    name: 'SecurityProfileDetail',
    component (resolve) {
      require(['../../components/Security/Profiles/Detail'], resolve)
    }
  },
  '/roles': {
    name: 'SecurityRolesList',
    component (resolve) {
      require(['../../components/Security/Roles/Browse'], resolve)
    }
  },
  '/role/create': {
    name: 'SecurityRolesCreate',
    component (resolve) {
      require(['../../components/Security/Roles/Create'], resolve)
    }
  },
  '/role/:id': {
    name: 'SecurityRolesUpdate',
    component (resolve) {
      require(['../../components/Security/Roles/Update'], resolve)
    }
  }
}
