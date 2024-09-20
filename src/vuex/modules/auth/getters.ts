import { AuthState } from './types'
import { SessionUser } from '@/models/SessionUser'
import { defineGetters } from 'direct-vuex'

const isActionAllowed = (
  user,
  controller,
  action,
  index = '*',
  collection = '*'
) => {
  if (!user) {
    return false
  }

  const rights = user.rights || []

  if (!rights || typeof rights !== 'object') {
    throw new Error(
      'rights parameter is mandatory for isActionAllowed function'
    )
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error(
      'controller parameter is mandatory for isActionAllowed function'
    )
  }
  if (!action || typeof action !== 'string') {
    throw new Error(
      'action parameter is mandatory for isActionAllowed function'
    )
  }
  // We filter in all the rights that match the request (including wildcards).
  const filteredRights = rights
    .filter(function(right) {
      return right.controller === controller || right.controller === '*'
    })
    .filter(function(right) {
      return right.action === action || right.action === '*'
    })
    .filter(function(right) {
      return right.index === index || right.index === '*'
    })
    .filter(function(right) {
      return right.collection === collection || right.collection === '*'
    })

  if (
    filteredRights.some(function(item) {
      return item.value === 'allowed'
    }) &&
    filteredRights.some(function(item) {
      return item.value === 'denied'
    })
  ) {
    return false
  } else if (
    filteredRights.some(function(item) {
      return item.value === 'allowed'
    })
  ) {
    return true
  }
  return false
}

export const getters = defineGetters<AuthState>()({
  isAuthenticated(state): boolean {
    return !!state?.user?.id
  },
  user(state): SessionUser | null {
    return state.user
  },
  userProfiles(state) {
    return state.user?.params.profileIds ?? []
  },
  tokenValid(state): boolean {
    return state.tokenValid
  },
  adminAlreadyExists(state): boolean {
    return state.adminAlreadyExists
  },

  // Index
  canSearchIndex(state): boolean {
    if (!state.user) {
      return false
    }
    const indexListRight = state.user.rights.filter(
      rights =>
        (rights.action === 'list' || rights.action === '*') &&
        (rights.controller === 'index' || rights.controller === '*')
    )

    return indexListRight[0] && indexListRight[0].value === 'allowed'
  },
  canCreateIndex(state): boolean {
    return isActionAllowed(state.user, 'index', 'create')
  },
  canDeleteIndex(state) {
    return index => isActionAllowed(state.user, 'index', 'delete', index)
  },

  // Collections
  canSearchCollection(state) {
    return index => isActionAllowed(state.user, 'collection', 'list', index)
  },
  canCreateCollection(state) {
    return index => isActionAllowed(state.user, 'collection', 'create', index)
  },
  canEditCollection(state) {
    return (index, collection) =>
      isActionAllowed(
        state.user,
        'collection',
        'updateMapping',
        index,
        collection
      )
  },
  canTruncateCollection(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'collection', 'truncate', index, collection)
  },

  // Documents CRUDL
  canReadDocument(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'get', index, collection)
  },
  canSearchDocument(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'search', index, collection)
  },
  canCreateDocument(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'create', index, collection)
  },
  canEditDocument(state) {
    return (index, collection) =>
      isActionAllowed(
        state.user,
        'document',
        'createOrReplace',
        index,
        collection
      )
  },
  canDeleteDocument(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'document', 'delete', index, collection)
  },

  // Realtime

  canSubscribe(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'realtime', 'subscribe', index, collection) &&
      isActionAllowed(state.user, 'realtime', 'unsubscribe', index, collection)
  },
  canPublish(state) {
    return (index, collection) =>
      isActionAllowed(state.user, 'realtime', 'publish', index, collection)
  },

  canManageRealtime(state, getters) {
    return (index, collection) =>
      getters.canSubscribe(index, collection) ||
      getters.canPublish(index, collection)
  },

  canManageDocuments(state, getters) {
    return (index, collection) =>
      getters.canReadDocument(index, collection) ||
      getters.canSearchDocument(index, collection) ||
      getters.canEditDocument(index, collection) ||
      getters.canCreateDocument(index, collection) ||
      getters.canDeleteDocument(index, collection)
  },

  // Roles
  canReadRole(state) {
    return isActionAllowed(state.user, 'security', 'getRole')
  },
  canSearchRole(state) {
    return isActionAllowed(state.user, 'security', 'searchRoles')
  },
  canEditRole(state) {
    return isActionAllowed(state.user, 'security', 'createOrReplaceRole')
  },
  canCreateRole(state) {
    return isActionAllowed(state.user, 'security', 'createRole')
  },
  canDeleteRole(state) {
    return isActionAllowed(state.user, 'security', 'deleteRole')
  },
  canManageRoles(state, getters) {
    return (
      getters.canReadRole ||
      getters.canSearchRole ||
      getters.canEditRole ||
      getters.canCreateRole ||
      getters.canDeleteRole
    )
  },

  // Profiles
  canReadProfile(state) {
    return isActionAllowed(state.user, 'security', 'getProfile')
  },
  canSearchProfile(state) {
    return isActionAllowed(state.user, 'security', 'searchProfiles')
  },
  canEditProfile(state) {
    return isActionAllowed(state.user, 'security', 'createOrReplaceProfile')
  },
  canCreateProfile(state) {
    return isActionAllowed(state.user, 'security', 'createProfile')
  },
  canDeleteProfile(state) {
    return isActionAllowed(state.user, 'security', 'deleteProfile')
  },
  canManageProfiles(state, getters) {
    return (
      getters.canReadProfile ||
      getters.canSearchProfile ||
      getters.canEditProfile ||
      getters.canCreateProfile ||
      getters.canDeleteProfile
    )
  },

  // Users
  canReadUser(state) {
    return isActionAllowed(state.user, 'security', 'getUser')
  },
  canSearchUser(state) {
    return isActionAllowed(state.user, 'security', 'searchUsers')
  },
  canEditUser(state) {
    return isActionAllowed(state.user, 'security', 'updateUser')
  },
  canCreateUser(state) {
    return isActionAllowed(state.user, 'security', 'createUser')
  },
  canDeleteUser(state) {
    return isActionAllowed(state.user, 'security', 'deleteUser')
  },
  canManageUsers(state, getters) {
    return (
      getters.canReadUser ||
      getters.canSearchUser ||
      getters.canEditUser ||
      getters.canCreateUser ||
      getters.canDeleteUser
    )
  },
  hasSecurityRights(state, getters) {
    return (
      getters.getterscanManageRoles ||
      getters.canManageProfiles ||
      getters.canManageUsers
    )
  },

  // Server
  canGetPublicApi(state) {
    return isActionAllowed(state.user, 'server', 'publicApi')
  },
  canGetOpenApi(state) {
    return isActionAllowed(state.user, 'server', 'openapi')
  }
})
