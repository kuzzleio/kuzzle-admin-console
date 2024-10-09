import Vue from 'vue';
import type { MutationTree } from 'vuex';

import { KKuzzleMutationsTypes } from './constants';
import type { CreateEnvironmentPayload, KuzzleState, UpdateEnvironmentPayload } from './types';

export const mutations: MutationTree<KuzzleState> = {
  [KKuzzleMutationsTypes.CREATE_ENVIRONMENT](state, payload: CreateEnvironmentPayload) {
    if (Object.keys(state.environments).includes(payload.id)) {
      return;
    }

    try {
      state.environments = {
        ...state.environments,
        [payload.id]: payload.environment,
      };
    } catch (error) {
      throw new Error(`[${payload.id}] - ${(error as Error).message}`);
    }
  },
  [KKuzzleMutationsTypes.UPDATE_ENVIRONMENT](state, payload: UpdateEnvironmentPayload) {
    if (!Object.keys(state.environments).includes(payload.id)) {
      throw new Error(`The given id ${payload.id} does not correspond to any existing
        environment.`);
    }

    state.environments = {
      ...state.environments,
      [payload.id]: payload.environment,
    };
  },
  [KKuzzleMutationsTypes.DELETE_ENVIRONMENT](state, id) {
    if (!Object.keys(state.environments).includes(id)) {
      return;
    }

    Vue.delete(state.environments, id);
  },
  [KKuzzleMutationsTypes.SET_ERROR_FROM_KUZZLE](state, error) {
    state.errorFromKuzzle = error;
  },
  [KKuzzleMutationsTypes.SET_CURRENT_ENVIRONMENT](state, payload) {
    state.currentId = payload;
  },
  [KKuzzleMutationsTypes.SET_CONNECTING](state, value: boolean) {
    state.connecting = value;
  },
  [KKuzzleMutationsTypes.SET_ONLINE](state, value: boolean) {
    state.online = value;
  },
};
