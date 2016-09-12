import kuzzle from '../services/kuzzle'
import store from '../vuex/modules/auth/store'

function isActionAllowed (sessionUser, controller, action, index = '*', collection = '*') {
  let allowed = kuzzle.security.isActionAllowed(sessionUser.rights, controller, action, index, collection)

  return allowed !== 'denied'
}

// Index CRUDL

export const canSearchIndex = () => {
  return isActionAllowed(store.state.user, 'read', 'listIndexes')
}
export const canCreateIndex = () => {
  return isActionAllowed(store.state.user, 'admin', 'createIndex')
}
export const canDeleteIndex = index => {
  return isActionAllowed(store.state.user, 'admin', 'deleteIndex', index)
}

// Collection CRUDL

export const canSearchCollection = index => {
  return isActionAllowed(store.state.user, 'read', 'listCollections', index)
}
export const canCreateCollection = index => {
  return isActionAllowed(store.state.user, 'write', 'createCollection', index)
}
export const canEditCollection = (index, collection) => {
  return isActionAllowed(store.state.user, 'admin', 'updateMapping', index, collection)
}
export const canTruncateCollection = (index, collection) => {
  return isActionAllowed(store.state.user, 'admin', 'truncateCollection', index, collection)
}

// Documents CRUDL

export const canReadDocument = (index, collection) => {
  return isActionAllowed(store.state.user, 'read', 'get', index, collection)
}
export const canSearchDocument = (index, collection) => {
  return isActionAllowed(store.state.user, 'read', 'search', index, collection)
}
export const canCreateDocument = (index, collection) => {
  return isActionAllowed(store.state.user, 'write', 'create', index, collection)
}
export const canEditDocument = (index, collection) => {
  return isActionAllowed(store.state.user, 'write', 'createOrReplace', index, collection)
}
export const canDeleteDocument = (index, collection) => {
  return isActionAllowed(store.state.user, 'write', 'delete', index, collection)
}

// Realtime

export const canSubscribe = (index, collection) => {
  return isActionAllowed(store.state.user, 'subscribe', 'on', index, collection) &&
    isActionAllowed(store.state.user, 'subscribe', 'off', index, collection)
}
export const canPublish = (index, collection) => {
  return isActionAllowed(store.state.user, 'write', 'publish', index, collection)
}

// Security roles CRUDL

export const canReadRole = () => {
  return isActionAllowed(store.state.user, 'security', 'getRole')
}
export const canSearchRole = () => {
  return isActionAllowed(store.state.user, 'security', 'searchRoles')
}
export const canEditRole = () => {
  return isActionAllowed(store.state.user, 'security', 'createOrReplaceRole')
}
export const canCreateRole = () => {
  return isActionAllowed(store.state.user, 'security', 'createRole')
}
export const canDeleteRole = () => {
  return isActionAllowed(store.state.user, 'security', 'deleteRole')
}

// Security profiles CRUDL

export const canReadProfile = () => {
  return isActionAllowed(store.state.user, 'security', 'getProfile')
}
export const canSearchProfile = () => {
  return isActionAllowed(store.state.user, 'security', 'searchProfiles')
}
export const canEditProfile = () => {
  return isActionAllowed(store.state.user, 'security', 'createOrReplaceProfile')
}
export const canCreateProfile = () => {
  return isActionAllowed(store.state.user, 'security', 'createProfile')
}
export const canDeleteProfile = () => {
  return isActionAllowed(store.state.user, 'security', 'deleteProfile')
}

// Security users CRUDL

export const canReadUser = () => {
  return isActionAllowed(store.state.user, 'security', 'getUser')
}
export const canSearchUser = () => {
  return isActionAllowed(store.state.user, 'security', 'searchUsers')
}
export const canEditUser = () => {
  return isActionAllowed(store.state.user, 'security', 'createOrReplaceUser')
}
export const canCreateUser = () => {
  return isActionAllowed(store.state.user, 'security', 'createUser')
}
export const canDeleteUser = () => {
  return isActionAllowed(store.state.user, 'security', 'deleteUser')
}

// Security access

export const canManageRealtime = (index, collection) => {
  return canSubscribe(index, collection) ||
    canPublish(index, collection)
}

export const canManageDocuments = (index, collection) => {
  return canReadDocument(index, collection) ||
    canSearchDocument(index, collection) ||
    canEditDocument(index, collection) ||
    canCreateDocument(index, collection) ||
    canDeleteDocument(index, collection)
}
export const canManageRoles = () => {
  return canReadRole() ||
    canSearchRole() ||
    canEditRole() ||
    canCreateRole() ||
    canDeleteRole()
}
export const canManageProfiles = () => {
  return canReadProfile() ||
    canSearchProfile() ||
    canEditProfile() ||
    canCreateProfile() ||
    canDeleteProfile()
}
export const canManageUsers = () => {
  return canReadUser() ||
    canSearchUser() ||
    canEditUser() ||
    canCreateUser() ||
    canDeleteUser()
}
export const hasSecurityRights = () => {
  return canManageRoles() ||
    canManageProfiles() ||
    canManageUsers()
}
