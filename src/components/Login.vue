<template>
  <div class="container">
    <div class="col m6">
      <h2 class="center-align">Login</h2>
      <div class="row">
        <form class="col s6 offset-s3" id="loginForm" method="post" @submit.prevent="doLogin(username, password)">
          <div class="row">
            <div class="input-field col s12">
              <input id="username" v-model="username" type="text" name="username" required
                     class="validate"/>
              <label for="username">Email</label>
            </div>
          </div>
          <div class="row">
            <div class="input-field col s12">
              <input v-model="password" type="password" name="password" id="pass" required
                     class="validate"/>
              <label for="pass">Password</label>
            </div>
          </div>
          <div class="row">
            <div class="col m12">
              <p class="right-align">
                <button class="btn btn-large waves-effect waves-light" type="submit" name="action">Login</button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
  import {doLogin} from '../vuex/modules/auth/actions'
  import {getError} from '../vuex/modules/common/getters'

  export default {
    data () {
      return {
        username: null,
        password: null
      }
    },
    vuex: {
      actions: {
        doLogin
      },
      getters: {
        error: getError
      }
    }
  }
</script>
