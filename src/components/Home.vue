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
      <main-spinner v-if="authInitializing"></main-spinner>
      <router-view v-else />
    </div>
    <b-alert
      class="rounded-0 text-center mb-0 "
      dismissible
      fade
      style="z-index: 2000;"
      variant="info"
      data-cy="noAdminAlert"
      :show="!$store.direct.getters.auth.adminAlreadyExists"
    >
      <i class="fa fa-exclamation-triangle mr-2" aria-hidden="true"></i>
      <b>Warning!</b> Your Kuzzle has no administrator user. It is strongly
      recommended <a href="#/signup" class="alert-link"> that you create one.</a
      ><i class="fa fa-exclamation-triangle ml-2" aria-hidden="true"></i>
    </b-alert>

    <b-modal
      id="tokenExpired"
      data-cy="Modal-tokenExpired"
      hide-footer
      title="Sorry, your session has expired"
      v-model="tokenExpiredIsOpen"
    >
      <login-form />
    </b-modal>
  </div>
</template>

<script>
import MainMenu from './Common/MainMenu'
import MainSpinner from './Common/MainSpinner'
import LoginForm from './Common/Login/Form'
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  components: {
    LoginForm,
    MainMenu,
    MainSpinner
  },
  data() {
    return {
      host: null,
      port: null,
      tokenExpiredIsOpen: false
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle', 'currentEnvironment']),
    tokenValid() {
      return this.$store.direct.state.auth.tokenValid
    },
    authInitializing() {
      return this.$store.direct.state.auth.initializing
    }
  },
  methods: {
    onTokenExpired() {
      this.$store.direct.dispatch.auth.setSession(null)
    },
    noop() {}
  },
  mounted() {
    this.$kuzzle.on('tokenExpired', () => this.onTokenExpired())
    this.$kuzzle.on('queryError', e => {
      if (this.currentEnvironment.backendMajorVersion === 1) {
        switch (e.id) {
          case 'security.token.invalid':
            this.onTokenExpired()
            break
          default:
            break
        }
      } else {
        switch (e.id) {
          case 'security.token.expired':
            this.onTokenExpired()
            break
          default:
            break
        }
      }
    })
  },
  beforeDestroy() {
    this.$kuzzle.removeListener('tokenExpired')
    this.$kuzzle.removeListener('queryError')
  },
  watch: {
    tokenValid: {
      handler(val) {
        setTimeout(() => {
          this.tokenExpiredIsOpen = !val
        }, 500)
      }
    }
  }
}
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
