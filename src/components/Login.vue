<template>
  <form method="post" @submit.prevent="doLogin(username, password)">
    <span>Welcome to the Kuzzle.io Back-Office</span>
    <div>
      <input v-model="username" type="text" name="username" placeholder="Username" required/>
      <input v-model="password" type="password" name="password" placeholder="Password" required />
    </div>
    <button type="submit">Login</button>

    <p class="error"></p>
  </form>
</template>

<script>
import { doLogin } from '../vuex/actions'

export default {
  data () {
    return {
      username: null,
      password: null
    }
  },
  vuex: {
    actions: { doLogin }
  }
}
</script>
