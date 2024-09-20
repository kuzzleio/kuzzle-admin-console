import type { ActionTree } from 'vuex';

import type { RootState } from '@/store/types';
import { LS_ENVIRONMENTS, LS_LAST_ENV, NO_ADMIN_WARNING_HOSTS, SS_CURRENT_ENV } from '@/utils';
import { KKuzzleActionsTypes, KKuzzleGettersTypes, KKuzzleMutationsTypes } from './constants';
import type { KuzzleState } from './types';

export const actions: ActionTree<KuzzleState, RootState> = {
  [KKuzzleActionsTypes.SET_CURRENT_ENVIRONMENT](state, id: string) {
    sessionStorage.setItem(SS_CURRENT_ENV, id);

    state.commit(KKuzzleMutationsTypes.SET_CURRENT_ENVIRONMENT, id);
  },
  [KKuzzleActionsTypes.CREATE_ENVIRONMENT](store, payload) {
    if (Object.keys(store.state.environments).includes(payload.id)) {
      throw new Error(
        `An environment with name ${payload.id} already exists. Please specify a different one.`,
      );
    }

    store.commit(KKuzzleMutationsTypes.CREATE_ENVIRONMENT, payload);
    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(store.state.environments));

    return payload.id;
  },
  [KKuzzleActionsTypes.DELETE_ENVIRONMENT](store, id) {
    store.commit(KKuzzleMutationsTypes.DELETE_ENVIRONMENT, id);

    if (store.state.currentId === id) {
      store.dispatch(KKuzzleActionsTypes.SET_CURRENT_ENVIRONMENT, null);
      sessionStorage.removeItem(SS_CURRENT_ENV);
    }

    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(store.state.environments));
  },
  [KKuzzleActionsTypes.UPDATE_TOKEN_CURRENT_ENVIRONMENT](store, payload) {
    store.commit(KKuzzleMutationsTypes.UPDATE_ENVIRONMENT, {
      id: store.state.currentId,
      environment: {
        ...store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT],
        token: payload,
      },
    });

    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(store.state.environments));
  },
  [KKuzzleActionsTypes.UPDATE_ENVIRONMENT](store, payload) {
    let mustReconnect = false;

    if (
      payload.id === store.state.currentId &&
      (payload.environment.host !== store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].host ||
        payload.environment.port !== store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].port ||
        payload.environment.ssl !== store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].ssl ||
        payload.backendMajorVersion !==
          store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].backendMajorVersion)
    ) {
      mustReconnect = true;
    }

    store.commit(KKuzzleMutationsTypes.UPDATE_ENVIRONMENT, {
      id: payload.id,
      environment: payload.environment,
    });

    localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(store.state.environments));

    if (mustReconnect) {
      store.dispatch(KKuzzleActionsTypes.SWITCH_ENVIRONMENT, payload.id);
    }

    return payload.id;
  },
  async [KKuzzleActionsTypes.CONNECT_TO_CURRENT_ENVIRONMENT](store) {
    if (!store.getters[KKuzzleGettersTypes.HAS_ENVIRONMENT]) {
      return;
    }

    if (!store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT]) {
      throw new Error('No current environment selected');
    }

    store.commit(KKuzzleMutationsTypes.SET_ERROR_FROM_KUZZLE, null);

    store.getters[KKuzzleGettersTypes.WRAPPER].disconnect();
    store.commit(KKuzzleMutationsTypes.SET_CONNECTING, true);

    try {
      await store.getters[KKuzzleGettersTypes.WRAPPER].connectToEnvironment(
        store.getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT],
      );
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'id' in error) {
        store.dispatch(KKuzzleActionsTypes.ON_CONNECTION_ERROR, error);
        return false;
      }
    }

    return true;
  },
  async [KKuzzleActionsTypes.SWITCH_ENVIRONMENT](store, id: string) {
    if (!id) {
      throw new Error('No id provided');
    }

    const environment = store.getters[KKuzzleGettersTypes.ENVIRONMENTS][id];
    if (!environment) {
      throw new Error(`Id ${id} does not match any environment`);
    }

    await store.dispatch(KKuzzleActionsTypes.SET_CURRENT_ENVIRONMENT, id);
    localStorage.setItem(LS_LAST_ENV, id);

    return await store.dispatch(KKuzzleActionsTypes.CONNECT_TO_CURRENT_ENVIRONMENT);
  },
  [KKuzzleActionsTypes.ON_CONNECTION_ERROR](store, error: Error) {
    store.commit(KKuzzleMutationsTypes.SET_CONNECTING, false);
    store.commit(KKuzzleMutationsTypes.SET_ONLINE, true);
    store.commit(KKuzzleMutationsTypes.SET_ERROR_FROM_KUZZLE, error.message);
  },
  [KKuzzleActionsTypes.LOAD_ENVIRONMENTS](store) {
    const loadedEnv = JSON.parse(localStorage.getItem(LS_ENVIRONMENTS) || '{}');

    Object.keys(loadedEnv).forEach((envName) => {
      const env = loadedEnv[envName];

      if (env.hideAdminWarning === undefined) {
        env.hideAdminWarning = NO_ADMIN_WARNING_HOSTS.includes(env.host);
      }

      store.commit(KKuzzleMutationsTypes.CREATE_ENVIRONMENT, {
        environment: env,
        id: envName,
      });
    });

    let currentId = sessionStorage.getItem(SS_CURRENT_ENV);
    if (currentId) {
      store.commit(KKuzzleMutationsTypes.SET_CURRENT_ENVIRONMENT, currentId);
    } else {
      currentId = localStorage.getItem(LS_LAST_ENV);
      store.dispatch(KKuzzleActionsTypes.SET_CURRENT_ENVIRONMENT, currentId);
    }
  },
};
