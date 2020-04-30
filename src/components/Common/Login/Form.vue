<template>
  <form
    id="loginForm"
    class="col s10 offset-s1"
    method="post"
    @submit.prevent="login()"
  >
    <div class="row">
      <div class="input-field col s12">
        <input
          id="username"
          v-model="username"
          v-focus
          type="text"
          name="username"
          required
          tabindex="1"
          class="validate"
        />
        <label for="username" :class="{ active: username }">Login</label>
      </div>
    </div>
    <div class="row">
      <div class="input-field col s12">
        <input
          id="pass"
          v-model="password"
          type="password"
          name="password"
          required
          tabindex="2"
          class="validate"
        />
        <label for="pass" :class="{ active: password }">Password</label>
      </div>
    </div>
    <div class="row">
      <div class="col s4">
        <p v-if="error" class="error card red-color white-text">
          <i class="fa fa-times dismiss-error" @click="dismissError()" />
          Login failed: <br />{{ error }}
        </p>
        <p v-if="!error">
          &nbsp;
        </p>
      </div>
      <div class="col s8">
        <p class="right">
          <a
            class="LoginAsAnonymous-Btn btn-flat waves-effect waves-teal"
            @click="loginAsGuest"
            >Login as Anonymous</a
          >
          <button
            class="btn waves-effect waves-light"
            type="submit"
            name="action"
            tabindex="3"
          >
            Login
          </button>
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
    background-color: rgba(255, 255, 255, 0.2);
  }
}
</style>

<script>
import Focus from '../../../directives/focus.directive'
export default {
  name: 'LoginForm',
  directives: {
    Focus
  },
  props: {
    onLogin: Function
  },
  data() {
    return {
      username: null,
      password: null,
      error: ''
    }
  },
  methods: {
    dismissError() {
      this.error = ''
    },
    async login() {
      this.error = ''
      try {
        await this.$store.direct.dispatch.auth.doLogin({
          username: this.username,
          password: this.password
        })
        this.onLogin()
      } catch (err) {
        this.error = err.message
      }
    },
    loginAsGuest() {
      this.error = ''
      this.$kuzzle.jwt = null
      this.$store.direct.dispatch.auth
        .prepareSession('anonymous')
        .then(() => {
          this.onLogin()
        })
        .catch(err => {
          this.error = err.message
        })
    }
  }
}
</script>
