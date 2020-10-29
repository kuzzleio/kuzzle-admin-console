<template>
  <div class="login">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s10 offset-s1 m8 offset-m2 l6 offset-l3">
          <div class="row">
            <div class="col s12">
              <h2 class="center-align logo">
                <img
                  src="../assets/logo.svg"
                  alt="Welcome to the Kuzzle Admin Console"
                  style="width: 70%"
                />
              </h2>
            </div>
          </div>
          <div class="row">
            <div class="col offset-s1 s10">
              <warning-header :text="bannerV4Text" />
            </div>
          </div>
          <div class="row">
            <div class="col offset-s4 s2">
              <environment-switch
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </div>
          </div>
          <div class="row">
            <login-form :on-login="onLogin" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style type="text/css" media="screen" scoped>
.login {
  position: fixed;
  top: 0;
  left: 0;
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
import WarningHeader from './Common/WarningHeader'

export default {
  name: 'Login',
  components: {
    LoginForm,
    EnvironmentSwitch,
    WarningHeader
  },
  data() {
    return {
      bannerV4Text:
        'Hey! A new version of the admin console is available <a target="_blank" href="http://next-console.kuzzle.io">here</a> you should try it!',
      environmentId: null
    }
  },
  methods: {
    onLogin() {
      // Set the body overflow to visible because the login modal set it to 'hidden'.
      // After login, the index route is pushed to view router and the body overflow is
      // not set to his original state
      // see src/components/Materialize/Modale.vue#62
      window.document.body.style.overflow = 'visible'

      if (this.$store.getters.routeBeforeRedirect) {
        this.$router.push({ name: this.$store.getters.routeBeforeRedirect })
      } else {
        this.$router.push({ name: 'Home' }).catch(() => {})
      }

      this.$store.direct.commit.routing.setRouteBeforeRedirect(undefined)
    },
    editEnvironment(id) {
      this.$emit('environment::create', id)
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id)
    },
    importEnv() {
      this.$emit('environment::importEnv')
    }
  }
}
</script>
