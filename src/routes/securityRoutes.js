export default {
  '/security': {
    name: 'Security',
    component (resolve) {
      require(['../components/Security/Layout'], resolve)
    },
    subRoutes: {
      '/users': {
        name: 'SecurityUsersList',
        component (resolve) {
          require(['../components/Security/Users/List'], resolve)
        }
      },
      '/profiles': {
        name: 'SecurityProfilesList',
        component (resolve) {
          require(['../components/Security/Users/List'], resolve)
        }
      },
      '/roles': {
        name: 'SecurityRolesList',
        component (resolve) {
          require(['../components/Security/Users/List'], resolve)
        }
      }
    }
  }
}
