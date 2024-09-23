import type { ActionTree } from 'vuex';

import { KKuzzleActionsTypes, KKuzzleGettersTypes } from '../Kuzzle';
import { getKuzzleSdk } from '../utils';
import { SessionUser } from '@/models/SessionUser';
import { StoreNamespaceTypes } from '@/store/namespace-types';
import type { RootState } from '@/store/types';
import { KAuthActionsTypes, KAuthGettersTypes, KAuthMutationsTypes } from './constants';
import type { AuthState } from './types';

export const actions: ActionTree<AuthState, RootState> = {
  async [KAuthActionsTypes.INIT](store) {
    store.commit(KAuthMutationsTypes.RESET);
    store.commit(KAuthMutationsTypes.SET_INITIALIZING, true);
    await store.dispatch(KAuthActionsTypes.CHECK_FIRST_ADMIN);
    await store.dispatch(KAuthActionsTypes.LOGIN_BY_TOKEN);
  },
  async [KAuthActionsTypes.CREATE_SINGLE_USE_TOKEN](store): Promise<string> {
    const { result } = await getKuzzleSdk(store.rootGetters).query({
      controller: 'auth',
      action: 'createToken',
      singleUse: true,
    });

    return result.token;
  },
  async [KAuthActionsTypes.SET_SESSION](store, token: string) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    await store.dispatch(
      `${StoreNamespaceTypes.KUZZLE}/${KKuzzleActionsTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT}`,
      token,
      { root: true },
    );

    if (token === null) {
      store.commit(KAuthMutationsTypes.SET_CURRENT_USER, null);
      store.commit(KAuthMutationsTypes.SET_TOKEN_VALID, false);
      store.commit(KAuthMutationsTypes.SET_INITIALIZING, false);
      return null;
    }

    if (token === 'anonymous') {
      const sessionUser = new SessionUser();
      const rights = await kuzzle.auth.getMyRights();
      sessionUser.rights = rights;

      store.commit(KAuthMutationsTypes.SET_CURRENT_USER, sessionUser);
      store.commit(KAuthMutationsTypes.SET_TOKEN_VALID, true);
      store.commit(KAuthMutationsTypes.SET_INITIALIZING, false);

      return sessionUser;
    }

    const sessionUser = new SessionUser();
    const user = await kuzzle.auth.getCurrentUser();
    sessionUser.id = user._id;
    sessionUser.token = token;
    sessionUser.params = user._source;
    const rights = await kuzzle.auth.getMyRights();
    sessionUser.rights = rights;

    store.commit(KAuthMutationsTypes.SET_CURRENT_USER, sessionUser);
    store.commit(KAuthMutationsTypes.SET_TOKEN_VALID, true);
    store.commit(KAuthMutationsTypes.SET_INITIALIZING, false);

    return sessionUser;
  },
  async [KAuthActionsTypes.DO_LOGIN](store, credentials: { username: string; password: string }) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    kuzzle.jwt = null;

    const jwt = await kuzzle.auth.login('local', credentials, '2h');
    return await store.dispatch(KAuthActionsTypes.SET_SESSION, jwt);
  },
  async [KAuthActionsTypes.LOGIN_BY_TOKEN](store) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    const currentEnvironment =
      store.rootGetters[`${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.CURRENT_ENVIRONMENT}`];

    if (currentEnvironment.token === 'anonymous') {
      kuzzle.jwt = null;
      return await store.dispatch(KAuthActionsTypes.SET_SESSION, 'anonymous');
    }

    if (!currentEnvironment.token) {
      kuzzle.jwt = null;
      return await store.dispatch(KAuthActionsTypes.SET_SESSION, null);
    } else {
      const res = await kuzzle.auth.checkToken(currentEnvironment.token);

      if (!res.valid) {
        kuzzle.jwt = null;
        return await store.dispatch(KAuthActionsTypes.SET_SESSION, null);
      } else {
        kuzzle.jwt = currentEnvironment.token;
        return await store.dispatch(KAuthActionsTypes.SET_SESSION, currentEnvironment.token);
      }
    }
  },
  async [KAuthActionsTypes.CHECK_FIRST_ADMIN](store) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    try {
      if (!(await kuzzle.server.adminExists({}))) {
        return store.commit(KAuthMutationsTypes.SET_ADMIN_EXISTS, false);
      }

      return store.commit(KAuthMutationsTypes.SET_ADMIN_EXISTS, true);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error.status === 403 || error.status === 401)
      ) {
        return store.commit(KAuthMutationsTypes.SET_ADMIN_EXISTS, true);
      } else {
        throw error;
      }
    }
  },
  async [KAuthActionsTypes.CHECK_TOKEN](store) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    const jwt =
      store.rootGetters[`${StoreNamespaceTypes.KUZZLE}/${KKuzzleGettersTypes.CURRENT_ENVIRONMENT}`]
        .token;

    if (!jwt) {
      return false;
    }

    if (jwt === 'anonymous') {
      return true;
    }

    const { valid } = await kuzzle.auth.checkToken(jwt);

    if (!valid) {
      await store.dispatch(KAuthActionsTypes.DO_LOGOUT);
      await store.dispatch(KAuthActionsTypes.SET_SESSION, null);
      return false;
    }

    kuzzle.jwt = jwt;

    if (!store.getters[KAuthGettersTypes.USER]) {
      await store.dispatch(KAuthActionsTypes.SET_SESSION, jwt);
    }

    return true;
  },
  async [KAuthActionsTypes.DO_LOGOUT](store) {
    const kuzzle = getKuzzleSdk(store.rootGetters);

    if (kuzzle.jwt) {
      await kuzzle.auth.logout();
    }

    kuzzle.jwt = null;
    store.dispatch(KAuthActionsTypes.SET_SESSION, null);

    return await store.dispatch(KAuthActionsTypes.CHECK_FIRST_ADMIN);
  },
  async [KAuthActionsTypes.DO_RESET_PASSWORD](store, data) {
    const kuzzle = getKuzzleSdk(store.rootGetters);
    kuzzle.jwt = null;
    const request = {
      controller: 'kuzzle-plugin-auth-passport-local/password',
      action: 'reset',
      body: data,
    };
    const response = await kuzzle.query(request);
    const jwt = response.result.jwt;
    return await store.dispatch(KAuthActionsTypes.SET_SESSION, jwt);
  },
};
