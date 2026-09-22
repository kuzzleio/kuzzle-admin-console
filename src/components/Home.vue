<template>
  <div class="Home m-0 flex h-full flex-col">
    <div class="Home-menuWrapper shrink-0">
      <main-menu
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </div>

    <div class="Home-routeWrapper grow overflow-hidden" data-cy="App-loggedIn">
      <main-spinner v-if="authInitializing" />
      <router-view v-else />
    </div>

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
    /*
     * L'avertissement est un toast persistant avec une action, poussé dans la
     * zone unique (ADR-0020). `b-toast` le gardait monté en permanence et
     * l'affichait par son `id` ; ici il n'existe que s'il a lieu d'être.
     */
    hideNoAdminWarning() {
      this.kuzzleStore.updateEnvironment({
        id: this.kuzzleStore.currentId,
        environment: {
          ...this.currentEnvironment,
          hideAdminWarning: true,
        },
      });

      /* Rien à masquer : l'action ferme le toast. */
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
      this.$toast.show({
        actions: [{ label: 'Ok, got it', handler: this.hideNoAdminWarning }],
        autoHideAfter: null,
        message:
          'Your Kuzzle has no administrator user. It is strongly recommended that you create one.',
        title: 'Warning!',
        variant: 'warning',
      });
    },
  },
};
</script>
