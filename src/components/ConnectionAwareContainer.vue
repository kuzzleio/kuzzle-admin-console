<template>
  <div class="ConnectionAwareContainer h-100">
    <template v-if="connecting">
      <div v-if="!showOfflineSpinner" data-cy="AntiGlitchOverlay" class="AntiGlitchOverlay" />
      <offline-spinner
        v-if="showOfflineSpinner"
        data-cy="App-offline"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </template>
    <template v-else>
      <error-page
        v-if="kuzzleError"
        data-cy="App-connectionError"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
      <router-view
        v-else
        data-cy="App-online"
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </template>
    <b-toast
      id="offline-toast"
      title="Offline"
      no-auto-hide
      no-close-button
      variant="warning"
      toaster="b-toaster-top-center"
      append="true"
    >
      It looks like your Kuzzle instance is currently unreachable
    </b-toast>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { antiGlitchOverlayTimeout } from '../utils';
import { useAuthStore, useKuzzleStore } from '@/stores';

import OfflineSpinner from './Common/Offline.vue';
import ErrorPage from './Error/KuzzleErrorPage.vue';

export default {
  name: 'ConnectionAwareContainer',
  components: {
    OfflineSpinner,
    ErrorPage,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      showOfflineSpinner: false,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle', 'currentEnvironment']),
    currentEnvironmentId() {
      return this.kuzzleStore.currentId;
    },
    kuzzleError() {
      return this.kuzzleStore.errorFromKuzzle;
    },
    online() {
      return this.kuzzleStore.online;
    },
    connecting() {
      return this.kuzzleStore.connecting;
    },
  },
  watch: {
    '$route.path': {
      immediate: false,
      handler() {
        this.authenticationGuard();
      },
    },
    $kuzzle: {
      immediate: true,
      handler(instance) {
        if (!instance) {
          return;
        }
        this.removeListeners();
        this.initListeners();
      },
    },
    currentEnvironmentId: {
      immediate: true,
      async handler() {
        try {
          await this.onEnvironmentSwitch();
        } catch (error) {
          this.$log.error(`ConnectionAwareContainer:currentEnvironmentWatch: ${error.message}`);
        }
      },
    },
    online: {
      immediate: true,
      handler() {
        this.checkConnection();
      },
    },
    connecting: {
      immediate: true,
      handler(val) {
        this.showOfflineSpinner = val;
        setTimeout(() => {
          this.showOfflineSpinner = true;
        }, antiGlitchOverlayTimeout);
      },
    },
  },
  beforeDestroy() {
    this.removeListeners();
  },
  methods: {
    initListeners() {
      if (!this.$kuzzle) {
        return;
      }
      this.$kuzzle.on('networkError', (error) => {
        this.$log.error(`ConnectionAwareContainer:kuzzle.on('networkError'): ${error.message}`);
      });
      this.$kuzzle.addListener('connected', async () => {
        this.kuzzleStore.connecting = false;
        this.kuzzleStore.online = true;

        this.$log.debug('ConnectionAwareContainer::initializing auth upon connection...');
        try {
          await this.authStore.init();
        } catch (error) {
          this.$log.error(
            `ConnectionAwareContainer:initializing auth: "${error.message}" - code: ${error.code} - id: ${error.id}`,
          );
          if (error.id === 'api.process.incompatible_sdk_version') {
            return this.kuzzleStore.onConnectionError(error);
          }
        }
        this.authenticationGuard();
      });
      this.$kuzzle.addListener('reconnected', () => {
        this.kuzzleStore.connecting = false;
        this.kuzzleStore.online = true;

        this.$log.debug('ConnectionAwareContainer::checking token after reconnection...');
        this.authStore.checkToken();
      });
      this.$kuzzle.addListener('disconnected', () => {
        this.$log.debug('ConnectionAwareContainer::backend went offline...');
        this.kuzzleStore.online = false;
      });
    },
    removeListeners() {
      if (!this.$kuzzle) {
        return;
      }
      this.$kuzzle.removeAllListeners('networkError');
      this.$kuzzle.removeAllListeners('connected');
      this.$kuzzle.removeAllListeners('reconnected');
      this.$kuzzle.removeAllListeners('disconnected');
    },
    checkConnection() {
      if (this.online === false && this.connecting === false) {
        this.$bvToast.show('offline-toast');
      } else {
        this.$bvToast.hide('offline-toast');
      }
    },
    updatePageTitle() {
      document.title = this.currentEnvironment
        ? `[${this.currentEnvironment.name}] Kuzzle Admin Console`
        : 'Kuzzle Admin Console';
    },
    async onEnvironmentSwitch() {
      this.$log.debug('ConnectionAwareContainer::environmentSwitched');
      this.authStore.tokenValid = false;

      this.updatePageTitle();
      this.removeListeners();
      this.initListeners();
      try {
        await this.kuzzleStore.connectToCurrentEnvironment();
      } catch (error) {
        this.$log.error(`ConnectionAwareContainer:onEnvironmentSwitch: ${error.message}`);
      }
    },
    async authenticationGuard() {
      this.$log.debug('ConnectionAwareContainer::authentication guard');
      if (this.$route.meta.skipLogin) {
        return;
      }
      if (
        this.$route.matched.some((record) => record.meta.requiresAuth) &&
        !this.authStore.isAuthenticated
      ) {
        this.$log.debug('ConnectionAwareContainer::not authenticated');
        this.$router.push({ name: 'Login', query: { to: this.$route.name } });
      }
    },
  },
};
</script>

<style>
.AntiGlitchOverlay {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}
</style>
