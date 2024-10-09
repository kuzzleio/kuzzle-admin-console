import type { GetterTree } from 'vuex';

import * as kuzzleV1 from '@/services/kuzzleWrapper-v1';
import * as kuzzleV2 from '@/services/kuzzleWrapper-v2';
import type { RootState } from '@/store/types';
import { isValidEnvironment } from '@/validators';
import { KKuzzleGettersTypes } from './constants';
import type { KuzzleState } from './types';

export const getters: GetterTree<KuzzleState, RootState> = {
  [KKuzzleGettersTypes.WRAPPER](_state, getters) {
    if (!getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT]) {
      return null;
    }

    switch (getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].backendMajorVersion) {
      case 1:
        return kuzzleV1.wrapper;
      case 2:
        return kuzzleV2.wrapper;
      default:
        throw new Error(
          `No Kuzzle wrapper found for version ${getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].backendMajorVersion}`,
        );
    }
  },
  [KKuzzleGettersTypes.$KUZZLE](_state, getters) {
    if (!getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT]) {
      return null;
    }

    switch (getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].backendMajorVersion) {
      case 1:
        return kuzzleV1.kuzzle;
      case 2:
        return kuzzleV2.kuzzle;
      default:
        throw new Error(
          `No Kuzzle SDK found for version ${getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT].backendMajorVersion}`,
        );
    }
  },
  [KKuzzleGettersTypes.CURRENT_ENVIRONMENT](state, getters) {
    if (!getters[KKuzzleGettersTypes.HAS_ENVIRONMENT]) {
      return null;
    }

    if (state.currentId === undefined) {
      return null;
    }

    return state.environments[state.currentId];
  },
  [KKuzzleGettersTypes.IS_CURRENT_ENVIRONMENT_VALID](_state, getters) {
    return isValidEnvironment(getters[KKuzzleGettersTypes.CURRENT_ENVIRONMENT]);
  },
  [KKuzzleGettersTypes.HAS_ENVIRONMENT](state) {
    return Object.keys(state.environments).length !== 0;
  },
  [KKuzzleGettersTypes.ENVIRONMENTS](state) {
    return state.environments;
  },
};
