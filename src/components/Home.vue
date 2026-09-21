<template>
  <div class="Home tw:m-0 tw:flex tw:h-full tw:flex-col">
    <div class="Home-menuWrapper tw:shrink-0">
      <main-menu
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </div>

    <div class="Home-routeWrapper tw:grow tw:overflow-hidden" data-cy="App-loggedIn">
      <main-spinner v-if="authInitializing" />
      <router-view v-else />
    </div>
    <b-toast
      id="no-admin-warning"
      variant="info"
      no-auto-hide
      toaster="b-toaster-bottom-right"
      title="Warning!"
      data-cy="noAdminWarning"
    >
      <p>
        Your Kuzzle has no administrator user. It is strongly recommended
        <a href="#/signup" class="alert-link"> that you create one.</a>
      </p>
      <div class="text-center">
        <b-button
          id="noAdminGotIt"
          title="Don't show this toast again for the current environment"
          variant="primary"
          size="sm"
          @click="hideNoAdminWarning"
        >
          Ok, got it
        </b-button>
      </div>
    </b-toast>

    <Dialog :open="tokenExpiredIsOpen" @update:open="tokenExpiredIsOpen = $event">
      <DialogContent data-cy="Modal-tokenExpired" labelled-by="token-expired-title">
        <DialogHeader>
          <DialogTitle id="token-expired-title">Sorry, your session has expired</DialogTitle>
        </DialogHeader>
        <login-form />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore, useKuzzleStore } from '@/stores';

import LoginForm from './Common/Login/Form.vue';
import MainMenu from './Common/MainMenu.vue';
import MainSpinner from './Common/MainSpinner.vue';

export default {
  name: 'Home',
  components: {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    LoginForm,
    MainMenu,
    MainSpinner,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      host: null,
      port: null,
      tokenExpiredIsOpen: false,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle', 'currentEnvironment']),
    tokenValid() {
      return this.authStore.tokenValid;
    },
    authInitializing() {
      return this.authStore.initializing;
    },
  },
  watch: {
    tokenValid: {
      handler(val) {
        setTimeout(() => {
          this.tokenExpiredIsOpen = !val;
        }, 500);
      },
    },
  },
  mounted() {
    this.$kuzzle.on('tokenExpired', () => this.onTokenExpired());
    this.$kuzzle.on('queryError', (e) => {
      if (this.currentEnvironment.backendMajorVersion === 1) {
        switch (e.id) {
          case 'security.token.invalid':
            this.onTokenExpired();
            break;
          default:
            break;
        }
      } else {
        switch (e.id) {
          case 'security.token.expired':
            this.onTokenExpired();
            break;
          default:
            break;
        }
      }
    });
    this.displayNoAdminWarning();
  },
  beforeDestroy() {
    this.$kuzzle.removeListener('tokenExpired');
    this.$kuzzle.removeListener('queryError');
  },
  methods: {
    hideNoAdminWarning() {
      this.kuzzleStore.updateEnvironment({
        id: this.kuzzleStore.currentId,
        environment: {
          ...this.currentEnvironment,
          hideAdminWarning: true,
        },
      });

      this.$bvToast.hide('no-admin-warning');
    },
    onTokenExpired() {
      this.authStore.setSession(null);
    },
    noop() {},
    displayNoAdminWarning() {
      if (this.authStore.adminAlreadyExists) {
        return;
      }
      if (this.currentEnvironment.hideAdminWarning) {
        return;
      }
      this.$bvToast.show('no-admin-warning');
    },
  },
};
</script>
