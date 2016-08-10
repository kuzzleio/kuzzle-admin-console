<template>
  <main-menu></main-menu>

  <main>
    <router-view></router-view>
  </main>

  <modal class="small-modal" id="tokenExpired" :has-footer="false" :can-close="false">
    <h5>Your session has expired</h5>
    <h6>Please, relogin</h6>
    <login-form :on-login="onLogin"></login-form>
  </modal>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  h6 {
    margin-bottom: 40px;
  }
</style>

<script>
  import MainMenu from './Materialize/MainMenu'
  import LoginForm from './Common/Login/Form'
  import Modal from './Materialize/Modal'
  import {tokenValid} from '../vuex/modules/auth/getters'

  export default {
    name: 'Home',
    components: {
      LoginForm,
      MainMenu,
      Modal
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
      }
    },
    vuex: {
      getters: {
        tokenValid
      }
    }
  }
</script>
