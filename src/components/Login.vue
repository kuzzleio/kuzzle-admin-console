<template>
  <form id="loginForm" method="post" @submit.prevent="doLogin(username, password)">
    <span>Welcome to the Kuzzle.io Back-Office</span>
    <div>
      <input v-model="username" type="text" name="username" placeholder="Username" required/>
      <input v-model="password" type="password" name="password" placeholder="Password" required />
    </div>
    <button type="submit">Login</button>

    <p class="error">{{error}}</p>
  </form>
</template>

<script>
import { doLogin } from '../vuex/modules/auth/actions'
import { getError } from '../vuex/modules/common/getters'

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
