<template>
  <div class="Signup">
    <div class="container">
      <div class="row">
        <div
          class="col card wrapper s10 offset-s1 m8 offset-m2 l8 offset-l2 xl6 offset-xl3"
        >
          <h2 class="center-align logo">
            <img
              src="../assets/logo.svg"
              alt="Welcome to the Kuzzle Admin Console"
              style="width: 60%"
            />
          </h2>
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
          <div class="row message-warning">
            <h5>Create an Admin Account</h5>
            <div class="divider" />
            <div class="message">
              <i class="fa fa-warning" />
              To secure your Kuzzle installation we recommend you select the
              “Remove anonymous user credentials” checkbox below.<br />
              To continue using an insecure installation and skip the Admin
              Account creation, click the “LOGIN AS ANONYMOUS” button below.
            </div>
          </div>
          <div class="row">
            <form
              id="loginForm"
              class="col s10 offset-s1"
              method="post"
              @submit.prevent="Signup"
            >
              <div class="row">
                <div class="input-field col s12">
                  <input
                    id="username"
                    v-model="username"
                    type="text"
                    name="username"
                    required
                    class="validate"
                  />
                  <label for="username">Username</label>
                </div>
              </div>
              <div class="row">
                <div class="input-field col s12">
                  <input
                    id="pass1"
                    v-model="password1"
                    type="password"
                    name="password1"
                    required
                    class="validate"
                  />
                  <label for="pass1">Password</label>
                </div>
              </div>
              <div class="row">
                <div class="input-field col s12">
                  <input
                    id="pass2"
                    v-model="password2"
                    type="password"
                    name="password2"
                    required
                    class="validate"
                  />
                  <label for="pass2">Confirm password</label>
                </div>
              </div>
              <div class="row">
                <div class="input-field col s12 reset">
                  <label>
                    <input
                      id="reset"
                      v-model="reset"
                      type="checkbox"
                      class="filled-in"
                    />
                    <span>Remove anonymous user credentials.</span>
                  </label>
                </div>
              </div>
              <div class="row">
                <div class="col s2">
                  <p class="message error">
                    {{ error }}
                  </p>
                </div>
                <div class="col s10">
                  <div v-if="waiting" class="preloader-wrapper active right">
                    <div class="spinner-layer">
                      <div class="circle-clipper left">
                        <div class="circle" />
                      </div>
                      <div class="gap-patch">
                        <div class="circle" />
                      </div>
                      <div class="circle-clipper right">
                        <div class="circle" />
                      </div>
                    </div>
                  </div>
                  <a
                    class="LoginAsAnonymous-Btn btn-flat waves-effect waves-teal"
                    @click="loginAsGuest"
                    >Login as Anonymous</a
                  >
                  <button
                    v-show="!waiting"
                    class="btn waves-effect waves-light right"
                    type="submit"
                    name="action"
                  >
                    CREATE ADMIN ACCOUNT
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch'
import WarningHeader from './Common/WarningHeader'

export default {
  name: 'Signup',
  components: {
    EnvironmentSwitch,
    WarningHeader
  },
  data() {
    return {
      username: '',
      password1: '',
      password2: '',
      reset: false,
      error: null,
      waiting: false,
      bannerV4Text:
        '<span>Hey! A new version of the admin console will be available soon. You can test the beta version <a target="_blank" href="http://next-console.kuzzle.io">here</a> now.</span>'
    }
  },
  methods: {
    async Signup() {
      if (
        this.username === '' ||
        this.password1 === '' ||
        this.password2 === ''
      ) {
        this.error = 'All fields are mandatory'
        return
      }

      if (this.password1 !== this.password2) {
        this.error = 'Password does not match'
        return
      }

      this.error = null
      this.waiting = true

      try {
        await this.$kuzzle.query({
          controller: 'security',
          action: 'createFirstAdmin',
          _id: this.username,
          reset: this.reset,
          body: {
            content: {},
            credentials: {
              local: {
                username: this.username,
                password: this.password1
              }
            }
          }
        })
        this.$store.direct.dispatch.kuzzle.updateTokenCurrentEnvironment(null)
        this.$store.direct.commit.auth.setAdminExits(true)
        this.$router.push({ name: 'Login' }).catch(() => {})
      } catch (err) {
        this.$router.push({ name: 'Login' }).catch(() => {})
      }
    },
    loginAsGuest() {
      this.error = ''
      this.$store.direct.dispatch.auth
        .prepareSession('anonymous')
        .then(() => {
          this.$router.go({ name: 'Data' })
        })
        .catch(err => {
          this.error = err.message
        })
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
