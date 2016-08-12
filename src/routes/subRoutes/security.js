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
  }
}
