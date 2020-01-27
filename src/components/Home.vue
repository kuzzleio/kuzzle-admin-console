<template>
  <div class="Home">
    <div class="Home-menuWrapper">
      <main-menu
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment"
        @environment::importEnv="importEnv"
      />
    </div>
    <b-alert
      class="position-fixed fixed-bottom m-0 rounded-0 text-center"
      dismissible
      fade
      style="z-index: 2000;"
      variant="info"
      :show="!$store.direct.getters.auth.adminAlreadyExists"
    >
      <i class="fa fa-exclamation-triangle mr-2" aria-hidden="true"></i>
      <b>Warning!</b> Your Kuzzle has no administrator user. It is strongly
      recommended <a href="#/signup" class="alert-link"> that you create one.</a
      ><i class="fa fa-exclamation-triangle ml-2" aria-hidden="true"></i>
    </b-alert>

    <div class="Home-routeWrapper">
      <router-view />
    </div>

    <b-modal
      id="tokenExpired"
      hide-footer
      title="Your session has expired"
      v-model="tokenExpiredIsOpen"
    >
      <login-form :on-login="onLogin" />
    </b-modal>
  </div>
</template>

<script>
import MainMenu from './Common/MainMenu'
import LoginForm from './Common/Login/Form'

export default {
  name: 'Home',
  components: {
    LoginForm,
    MainMenu
  },
  data() {
    return {
      host: null,
      port: null,
      tokenExpiredIsOpen: false
    }
  },
  watch: {
    '$store.direct.state.auth.tokenValid'(valid) {
      if (!valid) {
        this.tokenExpiredIsOpen = true
      }
    }
  },
  mounted() {
    this.$kuzzle.on('tokenExpired', () => this.onTokenExpired())
  },
  methods: {
    onLogin() {
      this.tokenExpiredIsOpen = false
      this.$emit('modal-close', 'tokenExpired')
    },
    editEnvironment(id) {
      this.$emit('environment::create', id)
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id)
    },
    importEnv() {
      this.$emit('environment::importEnv')
    },
    onTokenExpired() {
      this.$store.direct.commit.auth.setTokenValid(false)
    },
    noop() {}
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
