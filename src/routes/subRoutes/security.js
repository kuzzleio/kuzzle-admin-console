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
      require(['../../components/Security/Profiles/Create'], resolve)
    }
  },
  '/profiles/:id': {
    name: 'SecurityProfilesUpdate',
    component (resolve) {
      require(['../../components/Security/Profiles/Update'], resolve)
    }
  },
  '/roles': {
    name: 'SecurityRolesList',
    component (resolve) {
      require(['../../components/Security/Roles/Browse'], resolve)
    }
  },
  '/roles/create': {
    name: 'SecurityRolesCreate',
    component (resolve) {
      require(['../../components/Security/Roles/Create'], resolve)
    }
  },
  '/roles/:id': {
    name: 'SecurityRolesUpdate',
    component (resolve) {
      require(['../../components/Security/Roles/Update'], resolve)
    }
  }
}
