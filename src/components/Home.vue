<template>
  <main-menu></main-menu>

  <main class="loader">
    <router-view></router-view>
  </main>

  <modal class="small-modal" id="tokenExpired" :has-footer="false" :can-close="false">
    <h5>Your session has expired</h5>
    <h6>Please, relogin</h6>
    <login-form :on-login="onLogin"></login-form>
  </modal>

  <modal class="small-modal" id="kuzzleDisconnected" :has-footer="false" :can-close="false">
    <h5><i class="fa fa-warning red-color"></i> Can't connect to Kuzzle</h5>
    <kuzzle-disconnected :host="host" :port="port"></kuzzle-disconnected>
  </modal>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  h6 {
    margin-bottom: 40px;
  }
  .loader {
    transition: opacity .5s ease-out;
    opacity: 1;

    &.loading {
      opacity: 0.3;

      &:before {
        content: "loading ...";
        position: fixed;
        text-align: center;
        left: 0;
        right: 0;
        bottom: 10px;
      }
    }
  }
</style>

<script>
  import MainMenu from './Common/MainMenu'
  import LoginForm from './Common/Login/Form'
  import Modal from './Materialize/Modal'
  import KuzzleDisconnected from './Error/KuzzleDisconnected'
  import kuzzle from '../services/kuzzle'
  import { tokenValid } from '../vuex/modules/auth/getters'
  import { kuzzleIsConnected } from '../vuex/modules/common/kuzzle/getters'

  export default {
    name: 'Home',
    components: {
      LoginForm,
      MainMenu,
      Modal,
      KuzzleDisconnected
    },
    vuex: {
      getters: {
        tokenValid,
        kuzzleIsConnected
      }
    },
    data () {
      return {
        host: null,
        port: null
      }
    },
    methods: {
      onLogin () {
        this.$broadcast('modal-close', 'tokenExpired')
      }
    },
    watch: {
      tokenValid (valid) {
        if (!valid) {
          this.$broadcast('modal-open', 'tokenExpired')
        }
      },
      kuzzleIsConnected (isConnected) {
        if (!isConnected) {
          this.$broadcast('modal-open', 'kuzzleDisconnected')
          return
        }

        this.$broadcast('modal-close', 'kuzzleDisconnected')
      }
    },
    ready () {
      this.host = kuzzle.host
      this.port = kuzzle.wsPort
    }
  }
</script>
