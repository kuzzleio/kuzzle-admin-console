export default {
  '/users': {
    name: 'SecurityUsersList',
    component (resolve) {
      require(['../../components/Security/Users/List'], resolve)
    }
  },
  '/profiles': {
    name: 'SecurityProfilesList',
    component (resolve) {
      require(['../../components/Security/Profiles/List'], resolve)
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
      require(['../../components/Security/Roles/List'], resolve)
    }
  }
}
