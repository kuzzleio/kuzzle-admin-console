import { defineGetters } from 'direct-vuex';

import * as kuzzleV1 from '../../../services/kuzzleWrapper-v1';
import * as kuzzleV2 from '../../../services/kuzzleWrapper-v2';
import { isValidEnvironment } from '../../../validators';
import type { KuzzleState } from './types';

export const getters = defineGetters<KuzzleState>()({
  wrapper(state, getters) {
    if (!getters.currentEnvironment) {
      return null;
    }
    switch (getters.currentEnvironment.backendMajorVersion) {
      case 1:
        return kuzzleV1.wrapper;
      case 2:
        return kuzzleV2.wrapper;
      default:
        throw new Error(
          `No Kuzzle wrapper found for version ${getters.currentEnvironment.backendMajorVersion}`,
        );
    }
  },
  $kuzzle(state, getters) {
    if (!getters.currentEnvironment) {
      return null;
    }
    switch (getters.currentEnvironment.backendMajorVersion) {
      case 1:
        return kuzzleV1.kuzzle;
      case 2:
        return kuzzleV2.kuzzle;
      default:
        throw new Error(
          `No Kuzzle SDK found for version ${getters.currentEnvironment.backendMajorVersion}`,
        );
    }
  },
  currentEnvironment(state, getters) {
    if (!getters.hasEnvironment) {
      return null;
    }

    if (!state.currentId) {
      return null;
    }

    return state.environments[state.currentId];
  },
  isCurrentEnvironmentValid(state, getters) {
    return isValidEnvironment(getters.currentEnvironment);
  },
  hasEnvironment(state) {
    return Object.keys(state.environments).length !== 0;
  },
  environments(state) {
    // DAFUQ IZ DIS 4?
    return state.environments;
  },
});
