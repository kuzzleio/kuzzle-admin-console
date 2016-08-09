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
            <form class="col s10 offset-s1" id="loginForm" method="post" @submit.prevent="login(username, password)">
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
  import {doLogin} from '../vuex/modules/auth/actions'

  export default {
    name: 'Login',
    data () {
      return {
        username: null,
        password: null,
        error: null
      }
    },
    methods: {
      login (username, password) {
        this.doLogin(username, password).then(() => {
          // TODO redirect to the previously asked route
          this.$router.go({name: 'Home'})
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
