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
    path: '/users',
    name: 'SecurityUsersList',
    component (resolve) {
      require(['../../components/Security/Users/List'], resolve)
    }
  },
  {
    path: '/users/create',
    name: 'SecurityUsersCreate',
    component (resolve) {
      if (!canCreateUser()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Users/Create'], resolve)
      }
    }
  },
  {
    path: '/users/:id',
    name: 'SecurityUsersUpdate',
    component (resolve) {
      if (!canEditUser()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Users/Update'], resolve)
      }
    }
  },
  {
    path: '/profiles',
    name: 'SecurityProfilesList',
    component (resolve) {
      require(['../../components/Security/Profiles/List'], resolve)
    }
  },
  {
    path: '/profiles/create',
    name: 'SecurityProfilesCreate',
    component (resolve) {
      if (!canCreateProfile()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Profiles/Create'], resolve)
      }
    }
  },
  {
    path: '/profiles/:id',
    name: 'SecurityProfilesUpdate',
    component (resolve) {
      if (!canEditProfile()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Profiles/Update'], resolve)
      }
    }
  },
  {
    path: '/roles',
    name: 'SecurityRolesList',
    component (resolve) {
      require(['../../components/Security/Roles/List'], resolve)
    }
  },
  {
    path: '/roles/create',
    name: 'SecurityRolesCreate',
    component (resolve) {
      if (!canCreateRole()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Roles/Create'], resolve)
      }
    }
  },
  {
    path: '/roles/:id',
    name: 'SecurityRolesUpdate',
    component (resolve) {
      if (!canEditRole()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Roles/Update'], resolve)
      }
    }
  }
]
