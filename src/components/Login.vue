<template>
  <div class="login">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s10 offset-s1 m8 offset-m2 l4 offset-l4">
          <div class="row">
            <div class="col s12">
              <h2 class="center-align logo">
                <img src="../assets/logo.png" alt="Welcome to the Kuzzle Backoffice" style="width: 70%" />
              </h2>
            </div>
          </div>
          <div class="row">
            <div class="col offset-s1 s2">
              <env-switch @environment::create="editEnvironment" @environment::delete="deleteEnvironment"></env-switch>
            </div>
          </div>
          <div class="row">
        	  <login-form :on-login="onLogin"></login-form>
          </div>
        </div>
      </div>
    </div>
    <modal-create :environment-id="environmentId"></modal-create>
    <modal-delete :environment-id="environmentId"></modal-delete>
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
  import EnvSwitch from './Common/Environments/Switch'
  import ModalCreate from './Common/Environments/ModalCreate'
  import ModalDelete from './Common/Environments/ModalDelete'

  export default {
    name: 'Login',
    components: {
      LoginForm,
      EnvSwitch,
      ModalCreate,
      ModalDelete
    },
    data () {
      return {
        environmentId: null
      }
    },
    methods: {
      onLogin () {
        if (this.$router._prevTransition && this.$router._prevTransition.to &&
          this.$router._prevTransition.to.name !== 'Signup' &&
          this.$router._prevTransition.to.name !== 'Login') {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'Home'})
        }
      },
      editEnvironment (id) {
        this.environmentId = id
        this.$broadcast('modal-open', 'create-env')
      },
      deleteEnvironment (id) {
        this.environmentId = id
        this.$broadcast('modal-open', 'delete-env')
      }
    }
  }
</script>
