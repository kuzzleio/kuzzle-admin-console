import { defineStore } from 'pinia';

import { SessionUser } from '@/models/SessionUser';
import { LS_ENVIRONMENTS } from '@/utils';
import { useKuzzleStore } from './kuzzle';
import type { AuthState } from './types/auth';

const TOKEN_EXPIRY_CHECK_INTERVAL_MS = 20_000;
const TOKEN_REFRESH_THRESHOLD_MS = 30_000;
const TOKEN_REFRESH_MAX_RETRIES = 2;
const TOKEN_REFRESH_RETRY_DELAY_MS = 3_000;

/*
 * Surveillance de la session (ADR-0057), tenue hors de l'état du store : ni
 * un identifiant d'intervalle ni une promesse n'ont à être réactifs, ni à
 * être remis à zéro par `$reset()`.
 *
 * - `watchdogId` : l'intervalle qui compare l'expiration à l'heure ; une seule
 *   session est surveillée à la fois, celle de l'environnement courant.
 * - `currentCheck` : la même vérification, rejouée au retour sur l'onglet — un
 *   onglet en arrière-plan ou une machine en veille ne font pas tourner
 *   l'intervalle.
 * - `refreshInFlight` : l'intervalle, le retour sur l'onglet et un autre
 *   onglet peuvent demander un rafraîchissement en même temps ; ils attendent
 *   le même.
 */
let watchdogId: ReturnType<typeof setInterval> | undefined;
let currentCheck: (() => void) | undefined;
let refreshInFlight: Promise<void> | null = null;
let tabCheckInFlight: Promise<void> | null = null;
let tabListenersAttached = false;

const stopWatchdog = (): void => {
  if (watchdogId !== undefined) {
    clearInterval(watchdogId);
    watchdogId = undefined;
  }
  currentCheck = undefined;
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Reads the kuid from a Kuzzle token ("kauth-" prefix included), even an expired one.
const kuidFromToken = (token?: string | null): string | undefined => {
  const payload = token?.split('.')[1];

  if (!payload) {
    return undefined;
  }

  try {
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))._id;
  } catch {
    return undefined;
  }
};

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
    strategy: 'local',
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

    // Clés d'API (ADR-0070) : celles d'un utilisateur, par `security`, et les
    // siennes, par `auth`. Une session anonyme n'a pas de clés à elle.
    canSearchApiKeys(state): boolean {
      return isActionAllowed(state.user, 'security', 'searchApiKeys');
    },
    canCreateApiKey(state): boolean {
      return isActionAllowed(state.user, 'security', 'createApiKey');
    },
    canDeleteApiKey(state): boolean {
      return isActionAllowed(state.user, 'security', 'deleteApiKey');
    },
    canSearchOwnApiKeys(state): boolean {
      return state.user?.id !== -1 && isActionAllowed(state.user, 'auth', 'searchApiKeys');
    },
    canCreateOwnApiKey(state): boolean {
      return state.user?.id !== -1 && isActionAllowed(state.user, 'auth', 'createApiKey');
    },
    canDeleteOwnApiKey(state): boolean {
      return state.user?.id !== -1 && isActionAllowed(state.user, 'auth', 'deleteApiKey');
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
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      try {
        await this.checkFirstAdmin();

        const sessionId = kuzzleStore.currentEnvironment?.openidSessionId;

        if (sessionId) {
          this.strategy = 'keycloak';
          await this.loginByOpenId(sessionId);
        } else {
          this.strategy = 'local';
          await this.loginByToken();
        }
      } catch (error) {
        // Without this, the default SessionUser (id -1) passes the
        // authentication guard and the main spinner never goes away.
        this.user = null;
        this.tokenValid = false;
        this.initializing = false;
        throw error;
      }
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
      // `login` ne rend que le token : son expiration vient de `checkToken`.
      // Sans elle, une session ouverte par identifiants n'était jamais
      // surveillée, et expirait au bout de 2 h sans prévenir (ADR-0057).
      const { expiresAt } = await kuzzle.auth.checkToken(jwt);
      await this.afterLogin(expiresAt);
      return await this.setSession(jwt);
    },

    async loginByOpenId(sessionId: string) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      if (kuzzleStore.currentEnvironment === null) {
        throw new Error('No current environment selected');
      }

      if (await this.checkToken()) {
        const result = await kuzzle.auth.checkToken(kuzzle.jwt);
        await this.afterLogin(result.expiresAt);
        return await this.setSession(kuzzle.jwt);
      }

      // checkToken() logged out an expired session: its sessionId is closed.
      if (!kuzzleStore.currentEnvironment?.openidSessionId) {
        return await this.setSession(null);
      }

      try {
        const response = await kuzzle.query({
          controller: 'auth',
          action: 'login',
          strategy: 'keycloak',
          body: {
            sessionId,
            callbackUrl: globalThis.location.href,
          },
        });

        kuzzle.jwt = null;

        if (response.status === 200) {
          const res = await kuzzle.auth.checkToken(response.result.jwt);

          if (!res.valid) {
            kuzzle.jwt = null;
            return await this.setSession(null);
          } else {
            kuzzle.jwt = response.result.jwt;
            await this.afterLogin(response.result.expiresAt);
            return await this.setSession(response.result.jwt);
          }
        }
      } catch (error) {
        console.error('Error during OpenID login:', error);
        throw error;
      }
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
          await this.afterLogin(res.expiresAt);
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

      stopWatchdog();

      if (this.strategy === 'keycloak') {
        // After init() the user is the default one (id -1): the kuid is in the token.
        const kuid =
          this.user && this.user.id !== -1
            ? this.user.id
            : kuidFromToken(kuzzleStore.currentEnvironment?.token);

        try {
          await kuzzle.query({
            controller: 'keycloak',
            action: 'closeSession',
            kuid,
            sessionId: kuzzleStore.currentEnvironment?.openidSessionId,
          });
        } catch (error) {
          console.error('Error while closing the OpenID session:', error);
        } finally {
          kuzzleStore.updateOpenidSessionIdCurrentEnvironment(null);
        }
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

      if (this.strategy === 'keycloak') {
        throw new Error('not implemented yet');
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

    async afterLogin(expiresAt: number) {
      // Une seule session surveillée : celle d'avant (autre environnement,
      // token rafraîchi) ne doit pas continuer de tourner à côté.
      stopWatchdog();

      // Le rappel de `setInterval` ne peut pas être `async` : la promesse
      // rendue n'est attendue par personne, donc un rejet passerait sans bruit
      // (`@typescript-eslint/no-misused-promises`). On la chaîne explicitement.
      //
      // La surveillance est arrêtée *avant* de lancer le rafraîchissement : un
      // rafraîchissement plus long que le tick se chevaucherait avec le
      // suivant. C'est lui qui la réarme, avec la nouvelle expiration.
      const check = (): void => {
        if (expiresAt - Date.now() > TOKEN_REFRESH_THRESHOLD_MS) {
          return;
        }

        stopWatchdog();

        void this.tryRefreshConnection().catch((error) => {
          console.error('TRY_REFRESH_CONNECTION', error);
        });
      };

      currentCheck = check;
      watchdogId = setInterval(check, TOKEN_EXPIRY_CHECK_INTERVAL_MS);

      this.attachTabListeners();
    },

    /*
     * Deux filets, posés une fois pour toutes :
     *
     * - au retour sur l'onglet (`visibilitychange`, `focus`), l'expiration est
     *   revérifiée tout de suite, et le token est vérifié auprès de Kuzzle : une
     *   session fermée ailleurs se voit ici, et non à la requête suivante ;
     * - quand un autre onglet écrit un nouveau token pour l'environnement
     *   courant (`storage`), celui-ci l'adopte au lieu de rafraîchir le sien.
     */
    attachTabListeners() {
      if (tabListenersAttached || typeof window === 'undefined') {
        return;
      }
      tabListenersAttached = true;

      const onTabBack = (): void => {
        void this.checkSessionOnTabBack().catch((error) => {
          console.error('CHECK_SESSION_ON_TAB_BACK', error);
        });
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          onTabBack();
        }
      });
      window.addEventListener('focus', onTabBack);

      window.addEventListener('storage', (event) => {
        if (event.key !== LS_ENVIRONMENTS || event.newValue === null) {
          return;
        }
        void this.adoptTokenFromOtherTab(event.newValue).catch((error) => {
          console.error('ADOPT_TOKEN_FROM_OTHER_TAB', error);
        });
      });
    },

    async checkSessionOnTabBack() {
      // `visibilitychange` et `focus` arrivent ensemble au retour sur l'onglet.
      if (tabCheckInFlight) {
        return tabCheckInFlight;
      }

      const kuzzle = useKuzzleStore().$kuzzle;
      if (kuzzle === null || !kuzzle.jwt || !this.tokenValid) {
        return;
      }

      const jwt = kuzzle.jwt;
      tabCheckInFlight = (async () => {
        currentCheck?.();

        const { valid } = await kuzzle.auth.checkToken(jwt);
        // Un rafraîchissement a pu changer le token pendant la vérification.
        if (!valid && kuzzle.jwt === jwt) {
          await this.loseSession();
        }
      })().finally(() => {
        tabCheckInFlight = null;
      });

      return tabCheckInFlight;
    },

    async adoptTokenFromOtherTab(serializedEnvironments: string) {
      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;
      if (kuzzle === null || kuzzleStore.currentId === undefined || !this.tokenValid) {
        return;
      }

      let token: unknown;
      try {
        token = JSON.parse(serializedEnvironments)?.[kuzzleStore.currentId]?.token;
      } catch {
        return;
      }

      // Une déconnexion ailleurs (`null`) n'est pas adoptée : la session de
      // cet onglet se perdra d'elle-même, à la vérification suivante.
      if (typeof token !== 'string' || token === 'anonymous' || token === kuzzle.jwt) {
        return;
      }

      const { valid, expiresAt } = await kuzzle.auth.checkToken(token);
      if (!valid) {
        return;
      }

      kuzzle.jwt = token;
      await this.afterLogin(expiresAt);
      await this.setSession(token);
    },

    /*
     * La session ne peut plus être prolongée : la popup de reconnexion de
     * `Home` s'ouvre sur `tokenValid`, et la page reste où elle est. Se
     * déconnecter, comme avant, renvoyait à l'écran de connexion et perdait
     * le contexte.
     */
    async loseSession() {
      stopWatchdog();
      await this.setSession(null);
    },

    async tryRefreshConnection(retriesLeft?: number): Promise<void> {
      if (retriesLeft === undefined && refreshInFlight) {
        return refreshInFlight;
      }

      const kuzzleStore = useKuzzleStore();
      const kuzzle = kuzzleStore.$kuzzle;

      if (kuzzle === null) {
        throw new Error('Kuzzle is not initialized');
      }

      const attemptsLeft = retriesLeft ?? TOKEN_REFRESH_MAX_RETRIES;

      const attempt = async (): Promise<void> => {
        const jwtBefore = kuzzle.jwt;

        const refresh = async (): Promise<void> => {
          // Un autre onglet a pu rafraîchir, et cet onglet adopter son token,
          // pendant l'attente du verrou.
          if (kuzzle.jwt !== jwtBefore) {
            return;
          }

          const response =
            this.strategy === 'keycloak'
              ? await kuzzle.auth.refreshToken({
                  sessionId: kuzzleStore.currentEnvironment?.openidSessionId,
                  strategy: 'keycloak',
                })
              : await kuzzle.auth.refreshToken();

          kuzzle.jwt = response.jwt;
          await this.afterLogin(response.expiresAt);
          await this.setSession(response.jwt);
        };

        try {
          // Un verrou par environnement, partagé par les onglets : un seul
          // rafraîchit, les autres adoptent son token (`storage`).
          if (typeof navigator !== 'undefined' && navigator.locks) {
            await navigator.locks.request(
              `kuzzle-admin-console:token-refresh:${kuzzleStore.currentId}`,
              refresh,
            );
          } else {
            await refresh();
          }
        } catch (error) {
          console.error('TRY_REFRESH_CONNECTION', error);

          if (attemptsLeft > 0) {
            await wait(TOKEN_REFRESH_RETRY_DELAY_MS);
            await this.tryRefreshConnection(attemptsLeft - 1);
            return;
          }

          await this.loseSession();
        }
      };

      if (retriesLeft === undefined) {
        refreshInFlight = attempt().finally(() => {
          refreshInFlight = null;
        });
        return refreshInFlight;
      }

      return attempt();
    },
  },
});
