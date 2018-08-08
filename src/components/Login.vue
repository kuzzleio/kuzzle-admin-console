<template>
  <div class="login">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s10 offset-s1 m8 offset-m2 l6 offset-l3">
          <div class="row">
            <div class="col s12">
              <h2 class="center-align logo">
                <img src="../assets/logo.svg" alt="Welcome to the Kuzzle Backoffice" style="width: 70%" />
              </h2>
            </div>
          </div>
          <div class="row">
            <div class="col offset-s4 s2">
              <environment-switch
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment">
              </environment-switch>
            </div>
          </div>
          <div class="row">
        	  <login-form :on-login="onLogin"></login-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style type="text/css" media="screen" scoped>
  .login {
    position: fixed;
    top:0;
    left:0;
    bottom: 0;
    right: 0;
    padding-top: 50px;
    height: 100%;
    overflow: auto;
  }
  .logo {
    margin-top: 60px;
  }
</style>

<script>
  import LoginForm from './Common/Login/Form'
  import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch'
  import * as types from '../vuex/modules/common/routing/mutation-types'

  export default {
    name: 'Login',
    components: {
      LoginForm,
      EnvironmentSwitch
    },
    data () {
      return {
        environmentId: null
      }
    },
    methods: {
      onLogin () {
        window.document.body.style.overflow = 'visible'
        
        if (this.$store.getters.routeBeforeRedirect) {
          this.$router.push({name: this.$store.getters.routeBeforeRedirect})
        } else {
          this.$router.push({name: 'Home'})
        }

        this.$store.commit(types.SET_ROUTE_BEFORE_REDIRECT, null)
      },
      editEnvironment (id) {
        this.$emit('environment::create', id)
      },
      deleteEnvironment (id) {
        this.$emit('environment::delete', id)
      }
    }
  }
</script>
