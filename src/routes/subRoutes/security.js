/* istanbul ignore next */
import {
  canCreateUser,
  canEditUser,
  canCreateRole,
  canEditRole,
  canCreateProfile,
  canEditProfile
} from '../../services/userAuthorization'

export default {
  '/users': {
    name: 'SecurityUsersList',
    component (resolve) {
      require(['../../components/Security/Users/List'], resolve)
    }
  },
  '/users/create': {
    name: 'SecurityUsersCreate',
    component (resolve) {
      if (!canCreateUser()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Users/Create'], resolve)
      }
    }
  },
  '/users/:id': {
    name: 'SecurityUsersUpdate',
    component (resolve) {
      if (!canEditUser()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Users/Update'], resolve)
      }
    }
  },
  '/profiles': {
    name: 'SecurityProfilesList',
    component (resolve) {
      require(['../../components/Security/Profiles/List'], resolve)
    }
  },
  '/profiles/create': {
    name: 'SecurityProfilesCreate',
    component (resolve) {
      if (!canCreateProfile()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Profiles/Create'], resolve)
      }
    }
  },
  '/profiles/:id': {
    name: 'SecurityProfilesUpdate',
    component (resolve) {
      if (!canEditProfile()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Profiles/Update'], resolve)
      }
    }
  },
  '/roles': {
    name: 'SecurityRolesList',
    component (resolve) {
      require(['../../components/Security/Roles/List'], resolve)
    }
  },
  '/roles/create': {
    name: 'SecurityRolesCreate',
    component (resolve) {
      if (!canCreateRole()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Roles/Create'], resolve)
      }
    }
  },
  '/roles/:id': {
    name: 'SecurityRolesUpdate',
    component (resolve) {
      if (!canEditRole()) {
        require(['../../components/Common/PageNotAllowed'], resolve)
      } else {
        require(['../../components/Security/Roles/Update'], resolve)
      }
    }
  }
}
