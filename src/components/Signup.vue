<template>
  <div class="signup">
    <div class="container">
      <div class="row">
        <div class="col card wrapper s10 offset-s1 m8 offset-m2 l6 offset-l3">
          <div class="row">
            <div class="col s12">
              <h2 class="center-align logo">
                <img src="../assets/logo.svg" alt="Welcome to the Kuzzle Backoffice" style="width: 60%" />
              </h2>
            </div>
          </div>
          <div class="row">
            <div class="col offset-s4 s2">
              <environment-switch></environment-switch>
            </div>
          </div>
          <div class="row message-warning">
            <h5>First admin creation</h5>
            <div class="divider"></div>
            <div class="message">
              <i class="fa fa-warning"></i>
              If you want to secure your Kuzzle, you have to check the <em>"reset"</em> checkbox.
              If you do so, be sure to configure default and anonymous roles afterward.
            </div>
          </div>
          <div class="row">
            <form class="col s10 offset-s1" id="loginForm" method="post" @submit.prevent="signup">
              <div class="row">
                <div class="input-field col s12">
                  <input id="username" v-model="username" type="text" name="username" required
                         class="validate"/>
                  <label for="username">Username</label>
                </div>
              </div>
              <div class="row">
                <div class="input-field col s12">
                  <input v-model="password1" type="password" name="password1" id="pass1" required
                         class="validate"/>
                  <label for="pass1">Password</label>
                </div>
              </div>
              <div class="row">
                <div class="input-field col s12">
                  <input v-model="password2" type="password" name="password2" id="pass2" required
                         class="validate"/>
                  <label for="pass2">Password (confirmation)</label>
                </div>
              </div>
              <div class="row">
                <div class="input-field col s12 reset">
                  <input v-model="reset" type="checkbox" class="filled-in" id="reset"/>
                  <label for="reset">Reset default and anonymous rights?</label>
                </div>
              </div>
              <div class="row">
                <div class="col m6">
                  <p class="message error">{{error}}</p>
                </div>
                <div class="col m6">
                  <div class="preloader-wrapper active right" v-if="waiting" >
                    <div class="spinner-layer">
                      <div class="circle-clipper left">
                        <div class="circle"></div>
                      </div>
                      <div class="gap-patch">
                        <div class="circle"></div>
                      </div>
                      <div class="circle-clipper right">
                        <div class="circle"></div>
                      </div>
                    </div>
                  </div>
                  <button v-show="!waiting" class="btn waves-effect waves-light right" type="submit" name="action">
                    Create my first admin
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

<style lang="scss" rel="stylesheet/scss" scoped>
  .signup {
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

  .message-warning {
    padding: 25px;
    background-color: #e4e4e4;

    .divider {
      background-color: #CCC;
      margin-bottom: 10px;
    }
  }

  [type="checkbox"] + label {
    line-height: 19px;
  }

  .reset.input-field {
    margin-top: 0;
  }

  .message.error {
    margin-top: 25px;
  }

  .preloader-wrapper {
    width: 35px;
    height: 35px;
  }
</style>

<script>
  import kuzzle from '../services/kuzzle'
  import { setFirstAdmin } from '../vuex/modules/auth/actions'
  import EnvironmentSwitch from './Common/Environments/Switch'

  export default {
    name: 'Signup',
    components: {
      EnvironmentSwitch
    },
    data () {
      return {
        username: '',
        password1: '',
        password2: '',
        reset: false,
        error: null,
        waiting: false
      }
    },
    vuex: {
      actions: {
        setFirstAdmin
      }
    },
    methods: {
      signup () {
        if (this.username === '' || this.password1 === '' || this.password2 === '') {
          this.error = 'All fields are mandatory'
          return
        }

        if (this.password1 !== this.password2) {
          this.error = 'Password does not match'
          return
        }

        this.error = null
        this.waiting = true

        kuzzle
          .queryPromise(
            {controller: 'admin', action: 'createFirstAdmin'},
            {_id: this.username, body: {username: this.username, password: this.password1, reset: this.reset}})
          .then(() => {
            this.setFirstAdmin(true)
            this.$router.go({name: 'Login'})
          })
          .catch((err) => {
            // TODO manage this on the UI
            console.error('An error occurred while creating the first admin', err)
            this.$router.go({name: 'Login'})
          })
      }
    }
  }
</script>
