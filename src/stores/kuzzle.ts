import Vue from 'vue';
import type { Kuzzle } from 'kuzzle-sdk-v7';
import { defineStore } from 'pinia';

import * as kuzzleV1 from '@/services/kuzzleWrapper-v1';
import * as kuzzleV2 from '@/services/kuzzleWrapper-v2';
import { LS_ENVIRONMENTS, LS_LAST_ENV, NO_ADMIN_WARNING_HOSTS, SS_CURRENT_ENV } from '@/utils';
import { isValidEnvironment } from '@/validators';
import type { CreateEnvironmentPayload, KuzzleState } from './types/kuzzle';

export const useKuzzleStore = defineStore('kuzzle', {
  state: (): KuzzleState => ({
    environments: {},
    currentId: undefined,
    connecting: true,
    online: false,
    errorFromKuzzle: undefined,
  }),
  getters: {
    wrapper(): (kuzzleV1.KuzzleWrapperV1 & kuzzleV2.KuzzleWrapperV2) | null {
      if (this.currentEnvironment == null) {
        return null;
      }

      switch (this.currentEnvironment.backendMajorVersion) {
        case 1:
          return kuzzleV1.wrapper;
        case 2:
          return kuzzleV2.wrapper;
        default:
          throw new Error(
            `No Kuzzle wrapper found for version ${this.currentEnvironment.backendMajorVersion}`,
          );
      }
    },
    $kuzzle(): Kuzzle | null {
      if (this.currentEnvironment == null) {
        return null;
      }

      switch (this.currentEnvironment.backendMajorVersion) {
        case 1:
          return kuzzleV1.kuzzle;
        case 2:
          return kuzzleV2.kuzzle;
        default:
          throw new Error(
            `No Kuzzle SDK found for version ${this.currentEnvironment.backendMajorVersion}`,
          );
      }
    },
    currentEnvironment(state) {
      if (!this.hasEnvironment) {
        return null;
      }

      if (state.currentId === undefined) {
        return null;
      }

      return state.environments[state.currentId];
    },
    isCurrentEnvironmentValid() {
      return isValidEnvironment(this.currentEnvironment);
    },
    hasEnvironment(state) {
      return Object.keys(state.environments).length !== 0;
    },
  },
  actions: {
    setCurrentEnvironment(id: string | undefined) {
      if (typeof id === 'string') {
        sessionStorage.setItem(SS_CURRENT_ENV, id);
      } else {
        sessionStorage.removeItem(SS_CURRENT_ENV);
      }

      this.currentId = id;
    },
    createEnvironment(payload: CreateEnvironmentPayload) {
      if (Object.keys(this.environments).includes(payload.id)) {
        throw new Error(
          `An environment with name ${payload.id} already exists. Please specify a different one.`,
        );
      }

      try {
        this.environments = {
          ...this.environments,
          [payload.id]: payload.environment,
        };
      } catch (error) {
        throw new Error(`[${payload.id}] - ${(error as Error).message}`);
      }

      localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(this.environments));

      return payload.id;
    },
    deleteEnvironment(id: string) {
      if (!Object.keys(this.environments).includes(id)) {
        return;
      }

      Vue.delete(this.environments, id);

      if (this.currentId === id) {
        this.setCurrentEnvironment(undefined);
        sessionStorage.removeItem(SS_CURRENT_ENV);
      }

      localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(this.environments));
    },
    updateTokenCurrentEnvironment(payload: any) {
      if (!this.currentId || this.currentEnvironment == null) {
        throw new Error('No current environment selected');
      }

      this.environments = {
        ...this.environments,
        [this.currentId]: {
          ...this.currentEnvironment,
          token: payload,
        },
      };

      localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(this.environments));
    },
    updateEnvironment(payload: any) {
      let mustReconnect = false;

      if (
        payload.id === this.currentId &&
        (payload.environment.host !== this.currentEnvironment?.host ||
          payload.environment.port !== this.currentEnvironment?.port ||
          payload.environment.ssl !== this.currentEnvironment?.ssl ||
          payload.backendMajorVersion !== this.currentEnvironment?.backendMajorVersion)
      ) {
        mustReconnect = true;
      }

      if (!Object.keys(this.environments).includes(payload.id)) {
        throw new Error(`The given id ${payload.id} does not correspond to any existing
          environment.`);
      }

      this.environments = {
        ...this.environments,
        [payload.id]: payload.environment,
      };

      localStorage.setItem(LS_ENVIRONMENTS, JSON.stringify(this.environments));

      if (mustReconnect) {
        this.switchEnvironment(payload.id);
      }

      return payload.id;
    },
    async connectToCurrentEnvironment() {
      if (!this.hasEnvironment) {
        return;
      }

      if (this.currentEnvironment == null) {
        throw new Error('No current environment selected');
      }

      if (this.wrapper == null) {
        throw new Error('No Kuzzle wrapper set for the current environment');
      }

      this.errorFromKuzzle = undefined;
      this.wrapper.disconnect();
      this.connecting = true;

      try {
        await this.wrapper.connectToEnvironment(this.currentEnvironment);
      } catch (error) {
        this.onConnectionError(error as Error);
        return false;
      }

      return true;
    },
    async switchEnvironment(id: string) {
      if (!id) {
        throw new Error('No id provided');
      }

      const environment = this.environments[id];
      if (!environment) {
        throw new Error(`Id ${id} does not match any environment`);
      }

      this.setCurrentEnvironment(id);
      localStorage.setItem(LS_LAST_ENV, id);

      return await this.connectToCurrentEnvironment();
    },
    onConnectionError(error: Error) {
      this.connecting = false;
      this.online = true;
      this.errorFromKuzzle = error.message;
    },
    loadEnvironments() {
      const loadedEnv = JSON.parse(localStorage.getItem(LS_ENVIRONMENTS) ?? '{}');

      Object.keys(loadedEnv).forEach((envId) => {
        const env = loadedEnv[envId];

        if (env.hideAdminWarning === undefined) {
          env.hideAdminWarning = NO_ADMIN_WARNING_HOSTS.includes(env.host);
        }

        try {
          this.environments = {
            ...this.environments,
            [envId]: env,
          };
        } catch (error) {
          throw new Error(`[${env.id}] - ${(error as Error).message}`);
        }
      });

      let currentId = sessionStorage.getItem(SS_CURRENT_ENV);
      if (currentId) {
        this.currentId = currentId;
      } else {
        currentId = localStorage.getItem(LS_LAST_ENV);
        this.setCurrentEnvironment(currentId ?? undefined);
      }
    },
  },
});
