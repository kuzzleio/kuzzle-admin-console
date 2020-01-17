<template>
  <div class="Main">
    <main-menu
      @environment::create="editEnvironment"
      @environment::delete="deleteEnvironment"
      @environment::importEnv="importEnv"
    />

    <warning-header
      v-if="!$store.direct.getters.auth.adminAlreadyExists"
      :text="warningHeaderText"
    />
    <div class="wrapper" :style="`height: calc(100vh - ${topOffset}px)`">
      <router-view />
    </div>
    <modal
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
    </modal>

    <modal
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
    </modal>
  </div>
</template>

<script>
import MainMenu from './Common/MainMenu'
import WarningHeader from './Common/WarningHeader'
import LoginForm from './Common/Login/Form'
import Modal from './Materialize/Modal'
import KuzzleDisconnected from './Error/KuzzleDisconnected'

export default {
  name: 'Home',
  components: {
    LoginForm,
    MainMenu,
    Modal,
    KuzzleDisconnected,
    WarningHeader
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
      kuzzleDisconnectedIsOpen: false,
      warningHeaderText: `<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> <b>Warning!</b> Your Kuzzle has no administrator user. It is strongly recommended <a href="#/signup"> that you create one.</a><i class="fa fa-exclamation-triangle" aria-hidden="true"></i>`
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
h6 {
  margin-bottom: 40px;
}

// .wrapper {
// height: calc(98vh - 106px); // 66px = topBar, 40px = warning
// }

.loader {
  transition: opacity 0.5s ease-out;
  opacity: 1;

  &.loading {
    opacity: 0.3;
    z-index: 10;

    &:before {
      content: 'loading ...';
      position: fixed;
      text-align: center;
      left: 0;
      right: 0;
      bottom: 10px;
    }
  }
}
</style>
