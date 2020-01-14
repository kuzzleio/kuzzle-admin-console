<template>
  <form id="loginForm" method="post" @submit.prevent="login()">
    <div class="loginForm-inputs">
      <b-form-group
        :state="state"
        label="Login"
        label-for="username"
        label-cols-sm="4"
        label-cols-lg="3"
      >
        <b-form-input
          id="username"
          v-model="username"
          v-focus
          type="text"
          name="username"
          required
          tabindex="1"
          class="validate"
        />
      </b-form-group>
      <b-form-group
        :state="state"
        label="Password"
        label-for="pass"
        label-cols-sm="4"
        label-cols-lg="3"
      >
        <b-form-input
          id="pass"
          v-model="password"
          type="password"
          name="password"
          required
          tabindex="2"
          class="validate"
        />
      </b-form-group>
    </div>

    <div class="LoginForm-error" v-if="error">
      <b-alert variant="danger" show dismissible>
        Login failed: {{ error }}
      </b-alert>
    </div>

    <div class="LoginForm-buttons float-right mt-3">
      <b-button variant="link" @click="loginAsAnonymous" class="mr-3"
        >Login as Anonymous</b-button
      >
      <b-button variant="primary" type="submit" name="action" tabindex="3"
        >Login</b-button
      >
    </div>
  </form>
</template>

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
    loginAsAnonymous() {
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

<style lang="scss" rel="stylesheet/scss" scoped></style>
