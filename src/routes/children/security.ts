/* istanbul ignore next */
import {
  canCreateUser,
  canEditUser,
  canCreateRole,
  canEditRole,
  canCreateProfile,
  canEditProfile
} from '../../services/userAuthorization'

export default [
  {
    path: '/security/users',
    name: 'SecurityUsersList',
    meta: {
      section: 'users'
    },
    component(resolve) {
      require(['../../components/Security/Users/Page'], resolve)
    }
  },
  {
    path: '/security/users/custom-mapping',
    name: 'SecurityUsersEditCustomMapping',
    meta: {
      section: 'users'
    },
    component(resolve) {
      require(['../../components/Security/Users/EditCustomMapping'], resolve)
    }
  },
  {
    path: '/security/users/create',
    name: 'SecurityUsersCreate',
    meta: {
      section: 'users'
    },
    component(resolve) {
      require(['../../components/Security/Users/CreateOrUpdate'], resolve)
    }
  },
  {
    path: '/security/users/:id',
    name: 'SecurityUsersUpdate',
    meta: {
      section: 'users'
    },
    component(resolve) {
      require(['../../components/Security/Users/CreateOrUpdate'], resolve)
    },
    props: route => ({ id: route.params.id })
  },
  {
    path: '/security/profiles',
    name: 'SecurityProfilesList',
    meta: {
      section: 'profiles'
    },
    component(resolve) {
      require(['../../components/Security/Profiles/Page'], resolve)
    }
  },
  {
    path: '/security/profiles/create',
    name: 'SecurityProfilesCreate',
    meta: {
      section: 'profiles'
    },
    component(resolve) {
      require(['../../components/Security/Profiles/Create'], resolve)
    }
  },
  {
    path: '/security/profiles/:id',
    name: 'SecurityProfilesUpdate',
    meta: {
      section: 'profiles'
    },
    component(resolve) {
      require(['../../components/Security/Profiles/Update'], resolve)
    },
    props: route => ({ id: route.params.id })
  },
  {
    path: '/security/roles',
    name: 'SecurityRolesList',
    meta: {
      section: 'roles'
    },
    component(resolve) {
      require(['../../components/Security/Roles/Page'], resolve)
    }
  },
  {
    path: '/security/roles/create',
    name: 'SecurityRolesCreate',
    meta: {
      section: 'roles'
    },
    component(resolve) {
      require(['../../components/Security/Roles/CreateOrUpdate'], resolve)
    }
  },
  {
    path: '/security/roles/:id',
    name: 'SecurityRolesUpdate',
    meta: {
      section: 'roles'
    },
    component(resolve) {
      require(['../../components/Security/Roles/CreateOrUpdate'], resolve)
    },
    props: route => ({ id: route.params.id })
  }
]
