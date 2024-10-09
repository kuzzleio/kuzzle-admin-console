<template>
  <div class="Home">
    <div class="Home-menuWrapper">
      <main-menu
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </div>

    <div class="Home-routeWrapper" data-cy="App-loggedIn">
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

    <b-modal
      id="tokenExpired"
      v-model="tokenExpiredIsOpen"
      data-cy="Modal-tokenExpired"
      hide-footer
      title="Sorry, your session has expired"
    >
      <login-form />
    </b-modal>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useAuthStore, useKuzzleStore } from '@/stores';

import LoginForm from './Common/Login/Form.vue';
import MainMenu from './Common/MainMenu.vue';
import MainSpinner from './Common/MainSpinner.vue';

export default {
  name: 'Home',
  components: {
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

<style lang="scss" rel="stylesheet/scss" scoped>
.Home {
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-items: stretch;
}

.Home-menuWrapper {
  flex-basis: 66px;
}

.Home-routeWrapper {
  flex-grow: 1;
  flex-basis: 300px;
  overflow: hidden;
}
</style>
