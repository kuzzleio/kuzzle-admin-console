export enum KAuthGettersTypes {
  IS_AUTHENTICATED = 'isAuthenticated',
  USER = 'user',
  USER_PROFILES = 'userProfiles',
  TOKEN_VALID = 'tokenValid',
  ADMIN_ALREADY_EXISTS = 'adminAlreadyExists',

  // Index
  CAN_SEARCH_INDEX = 'canSearchIndex',
  CAN_CREATE_INDEX = 'canCreateIndex',
  CAN_DELETE_INDEX = 'canDeleteIndex',

  // Collection
  CAN_SEARCH_COLLECTION = 'canSearchCollection',
  CAN_CREATE_COLLECTION = 'canCreateCollection',
  CAN_EDIT_COLLECTION = 'canEditCollection',
  CAN_TRUNCATE_COLLECTION = 'canTruncateCollection',

  // Document CRUDL
  CAN_READ_DOCUMENT = 'canReadDocument',
  CAN_SEARCH_DOCUMENT = 'canSearchDocument',
  CAN_CREATE_DOCUMENT = 'canCreateDocument',
  CAN_EDIT_DOCUMENT = 'canEditDocument',
  CAN_DELETE_DOCUMENT = 'canDeleteDocument',

  // Realtime
  CAN_SUBSCRIBE = 'canSubscribe',
  CAN_PUBLISH = 'canPublish',
  CAN_MANAGE_REALTIME = 'canManageRealtime',
  CAN_MANAGE_DOCUMENTS = 'canManageDocuments',

  // Roles
  CAN_READ_ROLE = 'canReadRole',
  CAN_SEARCH_ROLE = 'canSearchRole',
  CAN_EDIT_ROLE = 'canEditRole',
  CAN_CREATE_ROLE = 'canCreateRole',
  CAN_DELETE_ROLE = 'canDeleteRole',
  CAN_MANAGE_ROLES = 'canManageRoles',

  // Profiles
  CAN_READ_PROFILE = 'canReadProfile',
  CAN_SEARCH_PROFILE = 'canSearchProfile',
  CAN_EDIT_PROFILE = 'canEditProfile',
  CAN_CREATE_PROFILE = 'canCreateProfile',
  CAN_DELETE_PROFILE = 'canDeleteProfile',
  CAN_MANAGE_PROFILES = 'canManageProfiles',

  // Users
  CAN_READ_USER = 'canReadUser',
  CAN_SEARCH_USER = 'canSearchUser',
  CAN_EDIT_USER = 'canEditUser',
  CAN_CREATE_USER = 'canCreateUser',
  CAN_DELETE_USER = 'canDeleteUser',
  CAN_MANAGE_USERS = 'canManageUsers',
  HAS_SECURITY_RIGHTS = 'hasSecurityRights',

  // Server
  CAN_GET_PUBLIC_API = 'canGetPublicApi',
  CAN_GET_OPEN_API = 'canGetOpenApi',
}
