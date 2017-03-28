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
    component (resolve) {
      require(['../../components/Security/Users/List'], resolve)
    }
  },
  {
    path: '/security/users/create',
    name: 'SecurityUsersCreate',
    meta: {
      section: 'users'
    },
    component (resolve) {
      if (!canCreateUser()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Users/Create'], resolve)
      }
    }
  },
  {
    path: '/security/users/:id',
    name: 'SecurityUsersUpdate',
    meta: {
      section: 'users'
    },
    component (resolve) {
      if (!canEditUser()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Users/Update'], resolve)
      }
    }
  },
  {
    path: '/security/profiles',
    name: 'SecurityProfilesList',
    meta: {
      section: 'profiles'
    },
    component (resolve) {
      require(['../../components/Security/Profiles/List'], resolve)
    }
  },
  {
    path: '/security/profiles/create',
    name: 'SecurityProfilesCreate',
    meta: {
      section: 'profiles'
    },
    component (resolve) {
      if (!canCreateProfile()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Profiles/Create'], resolve)
      }
    }
  },
  {
    path: '/security/profiles/:id',
    name: 'SecurityProfilesUpdate',
    meta: {
      section: 'profiles'
    },
    component (resolve) {
      if (!canEditProfile()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Profiles/Update'], resolve)
      }
    }
  },
  {
    path: '/security/roles',
    name: 'SecurityRolesList',
    meta: {
      section: 'roles'
    },
    component (resolve) {
      require(['../../components/Security/Roles/List'], resolve)
    }
  },
  {
    path: '/security/roles/create',
    name: 'SecurityRolesCreate',
    meta: {
      section: 'roles'
    },
    component (resolve) {
      if (!canCreateRole()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Roles/Create'], resolve)
      }
    }
  },
  {
    path: '/security/roles/:id',
    name: 'SecurityRolesUpdate',
    meta: {
      section: 'roles'
    },
    component (resolve) {
      if (!canEditRole()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Roles/Update'], resolve)
      }
    }
  }
]
