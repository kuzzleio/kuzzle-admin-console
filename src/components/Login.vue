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
    background: linear-gradient(45deg, rgba(31,77,81,1) 0%,rgba(0,75,82,1) 22%,rgba(18,105,109,1) 75%,rgba(0,117,127,1) 100%);
  }
  #loginForm {
    margin-top: 15px;
  }
  .logo {
    margin-top: 60px;
  }
  .error {
    color: #d54f58;
    font-size: 18px;
  }
</style>

<script>
  import LoginForm from './Common/Login/Form'

  export default {
    name: 'Login',
    components: {
      LoginForm
    },
    methods: {
      onLogin () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'Home'})
        }
      }
    }
  }
</script>
