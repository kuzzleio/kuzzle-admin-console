<template>
  <div class="Home">
    <div class="Home-menuWrapper">
      <main-menu
        @environment::create="$emit('environment::create', $event)"
        @environment::delete="$emit('environment::delete', $event)"
        @environment::importEnv="$emit('environment::importEnv')"
      />
    </div>
    <b-alert
      class="position-fixed fixed-bottom m-0 rounded-0 text-center"
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

    <div class="Home-routeWrapper">
      <main-spinner v-if="authInitializing"></main-spinner>
      <router-view v-else />
    </div>

    <b-modal
      id="tokenExpired"
      hide-footer
      title="You must login in order to continue"
      v-model="tokenExpiredIsOpen"
    >
      <login-form :on-login="onLogin" />
    </b-modal>
  </div>
</template>

<script>
import MainMenu from './Common/MainMenu'
import MainSpinner from './Common/MainSpinner'
import LoginForm from './Common/Login/Form'

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
    tokenValid() {
      return this.$store.direct.state.auth.tokenValid
    },
    authInitializing() {
      return this.$store.direct.state.auth.initializing
    }
  },
  methods: {
    onLogin() {
      this.tokenExpiredIsOpen = false
      this.$emit('modal-close', 'tokenExpired')
    },
    onTokenExpired() {
      this.$store.direct.commit.auth.setTokenValid(false)
    },
    noop() {}
  },
  mounted() {
    this.$kuzzle.on('tokenExpired', () => this.onTokenExpired())
    this.$kuzzle.on('queryError', e => {
      if (e.id === 'security.token.invalid') {
        this.onTokenExpired()
        this.tokenExpiredIsOpen = true
      }
    })
  },
  beforeDestroy() {
    this.$kuzzle.removeListener('tokenExpired')
    this.$kuzzle.removeListener('queryError')
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
