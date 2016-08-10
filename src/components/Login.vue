<template>
  <div class="container">
    <div class="col m6">
      <h2 class="center-align">
        <img src="../assets/logo.png" alt="Welcome to the Kuzzle Backoffice" />
      </h2>
      <div class="row">
        <login-form :on-login="onLogin"></login-form>
      </div>
    </div>
  </div>
</template>

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
