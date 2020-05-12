import { state } from '@/vuex/modules/auth/store'
import store from '@/vuex/store'

function isActionAllowed(
  sessionUser,
  controller,
  action,
  index = '*',
  collection = '*'
) {
  const allowed = store.getters.kuzzle.wrapper.isKuzzleActionAllowed(
    sessionUser.rights,
    controller,
    action,
    index,
    collection
  )

  return allowed !== 'denied'
}

// Index CRUDL

export const canSearchIndex = () => {
  const indexListRight = state.user.rights.filter(
    rights =>
      (rights.action === 'list' || rights.action === '*') &&
      (rights.controller === 'index' || rights.controller === '*')
  )

  return indexListRight[0] && indexListRight[0].value === 'allowed'
}
export const canCreateIndex = () => {
  return isActionAllowed(state.user, 'index', 'create')
}
export const canDeleteIndex = index => {
  return isActionAllowed(state.user, 'index', 'delete', index)
}

// Collection CRUDL

export const canSearchCollection = index => {
  return isActionAllowed(state.user, 'collection', 'list', index)
}
export const canCreateCollection = index => {
  return isActionAllowed(state.user, 'collection', 'create', index)
}
export const canEditCollection = (index, collection) => {
  return isActionAllowed(
    state.user,
    'collection',
    'updateMapping',
    index,
    collection
  )
}
export const canTruncateCollection = (index, collection) => {
  return isActionAllowed(
    state.user,
    'collection',
    'truncate',
    index,
    collection
  )
}

// Documents CRUDL

export const canReadDocument = (index, collection) => {
  return isActionAllowed(state.user, 'document', 'get', index, collection)
}
export const canSearchDocument = (index, collection) => {
  return isActionAllowed(state.user, 'document', 'search', index, collection)
}
export const canCreateDocument = (index, collection) => {
  return isActionAllowed(state.user, 'document', 'create', index, collection)
}
export const canEditDocument = (index, collection) => {
  return isActionAllowed(
    state.user,
    'document',
    'createOrReplace',
    index,
    collection
  )
}
export const canDeleteDocument = (index, collection) => {
  return isActionAllowed(state.user, 'document', 'delete', index, collection)
}

// Realtime

export const canSubscribe = (index, collection) => {
  return (
    isActionAllowed(state.user, 'realtime', 'subscribe', index, collection) &&
    isActionAllowed(state.user, 'realtime', 'unsubscribe', index, collection)
  )
}
export const canPublish = (index, collection) => {
  return isActionAllowed(state.user, 'realtime', 'publish', index, collection)
}

// Security roles CRUDL

export const canReadRole = () => {
  return isActionAllowed(state.user, 'security', 'getRole')
}
export const canSearchRole = () => {
  return isActionAllowed(state.user, 'security', 'searchRoles')
}
export const canEditRole = () => {
  return isActionAllowed(state.user, 'security', 'createOrReplaceRole')
}
export const canCreateRole = () => {
  return isActionAllowed(state.user, 'security', 'createRole')
}
export const canDeleteRole = () => {
  return isActionAllowed(state.user, 'security', 'deleteRole')
}

// Security profiles CRUDL

export const canReadProfile = () => {
  return isActionAllowed(state.user, 'security', 'getProfile')
}
export const canSearchProfile = () => {
  return isActionAllowed(state.user, 'security', 'searchProfiles')
}
export const canEditProfile = () => {
  return isActionAllowed(state.user, 'security', 'createOrReplaceProfile')
}
export const canCreateProfile = () => {
  return isActionAllowed(state.user, 'security', 'createProfile')
}
export const canDeleteProfile = () => {
  return isActionAllowed(state.user, 'security', 'deleteProfile')
}

// Security users CRUDL

export const canReadUser = () => {
  return isActionAllowed(state.user, 'security', 'getUser')
}
export const canSearchUser = () => {
  return isActionAllowed(state.user, 'security', 'searchUsers')
}
export const canEditUser = () => {
  return isActionAllowed(state.user, 'security', 'updateUser')
}
export const canCreateUser = () => {
  return isActionAllowed(state.user, 'security', 'createUser')
}
export const canDeleteUser = () => {
  return isActionAllowed(state.user, 'security', 'deleteUser')
}

// Security access

export const canManageRealtime = (index, collection) => {
  return canSubscribe(index, collection) || canPublish(index, collection)
}

export const canManageDocuments = (index, collection) => {
  return (
    canReadDocument(index, collection) ||
    canSearchDocument(index, collection) ||
    canEditDocument(index, collection) ||
    canCreateDocument(index, collection) ||
    canDeleteDocument(index, collection)
  )
}

export const canManageRoles = () => {
  return (
    canReadRole() ||
    canSearchRole() ||
    canEditRole() ||
    canCreateRole() ||
    canDeleteRole()
  )
}
export const canManageProfiles = () => {
  return (
    canReadProfile() ||
    canSearchProfile() ||
    canEditProfile() ||
    canCreateProfile() ||
    canDeleteProfile()
  )
}
export const canManageUsers = () => {
  return (
    canReadUser() ||
    canSearchUser() ||
    canEditUser() ||
    canCreateUser() ||
    canDeleteUser()
  )
}
export const hasSecurityRights = () => {
  return canManageRoles() || canManageProfiles() || canManageUsers()
}
