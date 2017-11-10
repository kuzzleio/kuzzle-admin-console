<template>
  <form class="col s10 offset-s1" id="loginForm" method="post" @submit.prevent="login()">
    <div class="row">
      <div class="input-field col s12">
        <input id="username" v-model="username" type="text" name="username" required tabindex="1"
               class="validate" v-focus />
        <label for="username" :class="{'active': username}">Login</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <input v-model="password" type="password" name="password" id="pass" required tabindex="2"
               class="validate"/>
        <label for="pass" :class="{'active': password}">Password</label>
      </div>
    </div>
    <div class="row">
      <div class="col s4">
        <p class="error card red-color white-text" v-if="error">
          <i class="fa fa-times dismiss-error" @click="dismissError()"></i>
          Login failed: <br />{{error}}
        </p>
        <p v-if="!error">&nbsp;</p>
      </div>
      <div class="col s8">
        <p class="right">
          <a class="btn-flat waves-effect waves-teal" @click="loginAsGuest">Login as Anonymous</a>
          <button class="btn waves-effect waves-light" type="submit" name="action" tabindex="3">Login</button>
        </p>
      </div>
    </div>
  </form>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  #loginForm {
    margin-top: 15px;
  }
  .error {
    position: relative;
    padding: 8px 12px;
    margin: 0;
  }
  .right-align {
    margin-top: 0;
  }
  .dismiss-error {
    position: absolute;
    right: 10px;
    cursor: pointer;
    padding: 3px;
    border-radius: 2px;

    &:hover {
      background-color: rgba(255, 255, 255, .2);
    }
  }
</style>


<script>
  import Focus from '../../../directives/focus.directive'
  import {
    DO_LOGIN,
    PREPARE_SESSION
  } from '../../../vuex/modules/auth/mutation-types'
  import {kuzzle} from '../../../services/kuzzleWrapper'

  export default {
    name: 'LoginForm',
    props: {
      onLogin: Function
    },
    directives: {
      Focus
    },
    data () {
      return {
        username: null,
        password: null,
        error: ''
      }
    },
    methods: {
      dismissError () {
        this.error = ''
      },
      login () {
        this.error = ''
        this.$store.dispatch(DO_LOGIN, {username: this.username, password: this.password})
          .then(() => {
            this.onLogin()
          }).catch((err) => {
            this.error = err.message
          })
      },
      loginAsGuest () {
        this.error = ''
        kuzzle.unsetJwtToken()
        this.$store.dispatch(PREPARE_SESSION, 'anonymous')
          .then(() => {
            this.onLogin()
          }).catch((err) => {
            this.error = err.message
          })
      }
    }
  }
</script>
