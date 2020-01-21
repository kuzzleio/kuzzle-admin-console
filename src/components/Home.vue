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
      class="small-modal"
      :has-footer="false"
      :can-close="false"
      :is-open="tokenExpiredIsOpen"
      :close="noop"
    >
      <h5>Your session has expired</h5>
      <h6>Please, relogin</h6>
      <login-form :on-login="onLogin" />
    </b-modal>

    <b-modal
      id="kuzzleDisconnected"
      class="small-modal"
      :has-footer="false"
      :can-close="false"
      :close="noop"
      :is-open="kuzzleDisconnectedIsOpen"
    >
      <h5><i class="fa fa-warning red-color" /> Can't connect to Kuzzle</h5>
      <kuzzle-disconnected
        :host="$store.direct.state.kuzzle.host"
        :port="$store.direct.state.kuzzle.port"
      />
    </b-modal>
  </div>
</template>

<script>
import MainMenu from './Common/MainMenu'
// import LoginForm from './Common/Login/Form'
// import Modal from './Materialize/Modal'
// import KuzzleDisconnected from './Error/KuzzleDisconnected'

export default {
  name: 'Home',
  components: {
    // LoginForm,
    MainMenu
    // Modal,
    // KuzzleDisconnected
  },
  computed: {
    topOffset() {
      const topBarHeight = 66
      const warningBarHeight = !this.$store.direct.getters.auth
        .adminAlreadyExists
        ? 40
        : 0
      return topBarHeight + warningBarHeight
    }
  },
  data() {
    return {
      host: null,
      port: null,
      tokenExpiredIsOpen: false,
      kuzzleDisconnectedIsOpen: false
    }
  },
  watch: {
    '$store.direct.state.auth.tokenValid'(valid) {
      if (!valid) {
        this.tokenExpiredIsOpen = true
      }
    },
    '$store.direct.state.kuzzle.connectedTo'(isConnected) {
      if (!isConnected) {
        this.kuzzleDisconnectedIsOpen = true
        return
      }
      this.kuzzleDisconnectedIsOpen = false
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
