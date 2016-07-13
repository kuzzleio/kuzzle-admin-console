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
  '/roles': {
    name: 'SecurityRolesList',
    component (resolve) {
      require(['../../components/Security/Roles/List'], resolve)
    }
  }
}
