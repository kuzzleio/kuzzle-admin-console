import { defineStore } from 'pinia';

import { SessionUser } from '@/models/SessionUser';
import { useKuzzleStore } from './kuzzle';
import type { AuthState } from './types/auth';

const isActionAllowed = (user, controller, action, index = '*', collection = '*'): boolean => {
  if (!user) {
    return false;
  }

  const rights = user.rights || [];

  if (!rights || typeof rights !== 'object') {
    throw new Error('rights parameter is mandatory for isActionAllowed function');
  }
  if (!controller || typeof controller !== 'string') {
    throw new Error('controller parameter is mandatory for isActionAllowed function');
  }
  if (!action || typeof action !== 'string') {
    throw new Error('action parameter is mandatory for isActionAllowed function');
  }
  // We filter in all the rights that match the request (including wildcards).
  const filteredRights = rights
    .filter(function (right) {
      return right.controller === controller || right.controller === '*';
    })
    .filter(function (right) {
      return right.action === action || right.action === '*';
    })
    .filter(function (right) {
      return right.index === index || right.index === '*';
    })
    .filter(function (right) {
      return right.collection === collection || right.collection === '*';
    });

  if (
    filteredRights.some(function (item) {
      return item.value === 'allowed';
    }) &&
    filteredRights.some(function (item) {
      return item.value === 'denied';
    })
  ) {
    return false;
  } else if (
    filteredRights.some(function (item) {
      return item.value === 'allowed';
    })
  ) {
    return true;
  }
  return false;
};

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: new SessionUser(),
    tokenValid: false,
    adminAlreadyExists: false,
    initializing: true,
  }),
  getters: {
    isAuthenticated(state): boolean {
      return !!state?.user?.id;
    },
    userProfiles(state): any {
      return state.user?.params?.profiles || [];
    },

    // Index
    canSearchIndex(state): boolean {
      if (state.user == null) {
        return false;
      }
      const indexListRight = state.user.rights.filter(
        (rights) =>
          (rights.action === 'list' || rights.action === '*') &&
          (rights.controller === 'index' || rights.controller === '*'),
      );

      return indexListRight[0] && indexListRight[0].value === 'allowed';
    },
    canCreateIndex(state): boolean {
      return isActionAllowed(state.user, 'index', 'create');
    },
    canDeleteIndex(state): (index: string) => boolean {
      return (index) => isActionAllowed(state.user, 'index', 'delete', index);
    },

    // Collection
    canSearchCollection(state): (index: string) => boolean {
      return (index) => isActionAllowed(state.user, 'collection', 'list', index);
    },
    canCreateCollection(state): (index: string) => boolean {
      return (index) => isActionAllowed(state.user, 'collection', 'create', index);
    },
    canEditCollection(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'collection', 'updateMapping', index, collection);
    },
    canTruncateCollection(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'collection', 'truncate', index, collection);
    },

    // Document CRUDL
    canReadDocument(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'document', 'get', index, collection);
    },
    canSearchDocument(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'document', 'search', index, collection);
    },
    canCreateDocument(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'document', 'create', index, collection);
    },
    canEditDocument(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'document', 'createOrReplace', index, collection);
    },
    canDeleteDocument(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'document', 'delete', index, collection);
    },

    // Realtime
    canSubscribe(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'realtime', 'subscribe', index, collection) &&
        isActionAllowed(state.user, 'realtime', 'unsubscribe', index, collection);
    },
    canPublish(state): (index: string, collection: string) => boolean {
      return (index, collection) =>
        isActionAllowed(state.user, 'realtime', 'publish', index, collection);
    },
    canManageRealtime(): (index: string, collection: string) => boolean {
      return (index, collection) =>
        this.canSubscribe(index, collection) || this.canPublish(index, collection);
    },
    canManageDocuments(): (index: string, collection: string) => boolean {
      return (index, collection) =>
        this.canReadDocument(index, collection) ||
        this.canSearchDocument(index, collection) ||
        this.canEditDocument(index, collection) ||
        this.canCreateDocument(index, collection) ||
        this.canDeleteDocument(index, collection);
    },

    // Roles
    canReadRole(state): boolean {
      return isActionAllowed(state.user, 'security', 'getRole');
    },
    canSearchRole(state): boolean {
      return isActionAllowed(state.user, 'security', 'searchRoles');
    },
    canEditRole(state): boolean {
      return isActionAllowed(state.user, 'security', 'createOrReplaceRole');
    },
    canCreateRole(state): boolean {
      return isActionAllowed(state.user, 'security', 'createRole');
    },
    canDeleteRole(state): boolean {
      return isActionAllowed(state.user, 'security', 'deleteRole');
    },
    canManageRoles(): boolean {
      return (
        this.canReadRole ||
        this.canSearchRole ||
        this.canEditRole ||
        this.canCreateRole ||
        this.canDeleteRole
      );
    },

    // Profiles
    canReadProfile(state): boolean {
      return isActionAllowed(state.user, 'security', 'getProfile');
    },
    canSearchProfile(state): boolean {
      return isActionAllowed(state.user, 'security', 'searchProfiles');
    },
    canEditProfile(state): boolean {
      return isActionAllowed(state.user, 'security', 'createOrReplaceProfile');
    },
    canCreateProfile(state): boolean {
      return isActionAllowed(state.user, 'security', 'createProfile');
    },
    canDeleteProfile(state): boolean {
      return isActionAllowed(state.user, 'security', 'deleteProfile');
    },
    canManageProfiles(): boolean {
      return (
        this.canReadProfile ||
        this.canSearchProfile ||
        this.canEditProfile ||
        this.canCreateProfile ||
        this.canDeleteProfile
      );
    },

    // Users
    canReadUser(state): boolean {
      return isActionAllowed(state.user, 'security', 'getUser');
    },
    canSearchUser(state): boolean {
      return isActionAllowed(state.user, 'security', 'searchUsers');
    },
    canEditUser(state): boolean {
      return isActionAllowed(state.user, 'security', 'updateUser');
    },
    canCreateUser(state): boolean {
      return isActionAllowed(state.user, 'security', 'createUser');
    },
    canDeleteUser(state): boolean {
      return isActionAllowed(state.user, 'security', 'deleteUser');
    },
    canManageUsers(): boolean {
      return (
        this.canReadUser ||
        this.canSearchUser ||
        this.canEditUser ||
        this.canCreateUser ||
        this.canDeleteUser
      );
    },
    hasSecurityRights(): boolean {
      return this.canManageRoles || this.canManageProfiles || this.canManageUsers;
    },

    // Server
    canGetPublicApi(state): boolean {
      return isActionAllowed(state.user, 'server', 'publicApi');
    },
    canGetOpenApi(state): boolean {
      return isActionAllowed(state.user, 'server', 'openapi');
    },
  },
  actions: {
    async init() {
      this.reset();
      this.initializing = true;
      await this.checkFirstAdmin();
      await this.loginByToken();
    },
    async createSingleUseToken(): Promise<string> {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      const { result } = await kuzzle.query({
        controller: 'auth',
        action: 'createToken',
        singleUse: true,
      });

      return result.token;
    },
    async setSession(token: string | null) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      await kuzzleStore.updateTokenCurrentEnvironment(token);

      if (token === null) {
        this.user = null;
        this.tokenValid = false;
        this.initializing = false;
        return null;
      }

      if (token === 'anonymous') {
        const sessionUser = new SessionUser();
        const rights = await kuzzle.auth.getMyRights();
        sessionUser.rights = rights;

        this.user = sessionUser;
        this.tokenValid = true;
        this.initializing = false;

        return sessionUser;
      }

      const sessionUser = new SessionUser();
      const user = await kuzzle.auth.getCurrentUser();
      sessionUser.id = user._id;
      sessionUser.token = token;
      sessionUser.params = user._source;
      const rights = await kuzzle.auth.getMyRights();
      sessionUser.rights = rights;

      this.user = sessionUser;
      this.tokenValid = true;
      this.initializing = false;

      return sessionUser;
    },
    async doLogin(credentials: { username: string; password: string }) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      kuzzle.jwt = null;

      const jwt = await kuzzle.auth.login('local', credentials, '2h');
      return await this.setSession(jwt);
    },
    async loginByToken() {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (kuzzleStore.currentEnvironment?.token === 'anonymous') {
        kuzzle.jwt = null;
        return await this.setSession('anonymous');
      }

      if (!kuzzleStore.currentEnvironment?.token) {
        kuzzle.jwt = null;
        return await this.setSession(null);
      } else {
        const res = await kuzzle.auth.checkToken(kuzzleStore.currentEnvironment.token);

        if (!res.valid) {
          kuzzle.jwt = null;
          return await this.setSession(null);
        } else {
          kuzzle.jwt = kuzzleStore.currentEnvironment.token;
          return await this.setSession(kuzzleStore.currentEnvironment.token);
        }
      }
    },
    async checkFirstAdmin() {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      try {
        if (!(await kuzzle.server.adminExists({}))) {
          this.adminAlreadyExists = false;
          return;
        }

        this.adminAlreadyExists = true;
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          (error.status === 403 || error.status === 401)
        ) {
          this.adminAlreadyExists = true;
        } else {
          throw error;
        }
      }
    },
    async checkToken() {
      const kuzzleStore = useKuzzleStore();
      const jwt = kuzzleStore.currentEnvironment?.token;
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (!jwt) {
        return false;
      }

      if (jwt === 'anonymous') {
        return true;
      }

      const { valid } = await kuzzle.auth.checkToken(jwt);

      if (!valid) {
        await this.doLogout();
        await this.setSession(null);

        return false;
      }

      kuzzle.jwt = jwt;

      if (this.user == null) {
        await this.setSession(jwt);
      }

      return true;
    },
    async doLogout() {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (kuzzle.jwt) {
        await kuzzle.auth.logout();
      }

      kuzzle.jwt = null;
      this.setSession(null);

      return await this.checkFirstAdmin();
    },
    async doResetPassword(data) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      kuzzle.jwt = null;
      const request = {
        controller: 'kuzzle-plugin-auth-passport-local/password',
        action: 'reset',
        body: data,
      };
      const response = await kuzzle.query(request);
      const jwt = response.result.jwt;

      return await this.setSession(jwt);
    },
    reset() {
      this.$reset();
    },
  },
});
