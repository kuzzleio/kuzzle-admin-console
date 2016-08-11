<template>
  <form class="col s10 offset-s1" id="loginForm" method="post" @submit.prevent="login()">
    <div class="row">
      <div class="input-field col s12">
        <input id="username" v-model="username" type="text" name="username" required tabindex="1"
               class="validate"/>
        <label for="username">Email</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <input v-model="password" type="password" name="password" id="pass" required tabindex="2"
               class="validate"/>
        <label for="pass">Password</label>
      </div>
    </div>
    <div class="row">
      <div class="col m6">
        <p class="error">{{error}}</p>
      </div>
      <div class="col m6">
        <p class="right-align">
          <button class="btn waves-effect waves-light" type="submit" name="action" tabindex="3">Login</button>
        </p>
      </div>
    </div>
  </form>
</template>

<style type="text/css" media="screen" scoped>
  #loginForm {
    margin-top: 15px;
  }
  .error {
    color: #d54f58;
    font-size: 18px;
  }
</style>


<script>
  import {doLogin} from '../../../vuex/modules/auth/actions'

  export default {
    name: 'LoginForm',
    props: {
      onLogin: Function
    },
    data () {
      return {
        username: null,
        password: null,
        error: null
      }
    },
    methods: {
      login () {
        this.error = null
        this.doLogin(this.username, this.password)
          .then(() => {
            this.onLogin()
          }).catch((err) => {
            this.error = err.message
          })
      }
    },
    vuex: {
      actions: {
        doLogin
      }
    }
  }
</script>