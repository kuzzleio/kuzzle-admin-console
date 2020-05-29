<template>
  <form id="loginForm" method="post" @submit.prevent="login()">
    <div class="loginForm-inputs">
      <b-form-group
        label="Login"
        label-for="username"
        label-cols-sm="4"
        label-cols-lg="3"
      >
        <b-form-input
          autofocus
          class="validate"
          data-cy="Login-username"
          id="username"
          name="username"
          required
          v-model="username"
          tabindex="1"
          type="text"
        />
      </b-form-group>
      <b-form-group
        label="Password"
        label-for="pass"
        label-cols-sm="4"
        label-cols-lg="3"
      >
        <b-form-input
          data-cy="Login-password"
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
      <b-button
        class="mr-3"
        data-cy="LoginAsAnonymous-Btn"
        variant="link"
        @click="loginAsAnonymous"
        >Login as Anonymous</b-button
      >
      <b-button
        variant="primary"
        data-cy="Login-submitBtn"
        type="submit"
        name="action"
        tabindex="3"
        >Login</b-button
      >
    </div>
  </form>
</template>

<script>
import Focus from '../../../directives/focus.directive'
import { mapGetters } from 'vuex'
export default {
  name: 'LoginForm',
  directives: {
    Focus
  },
  props: {
    onLogin: { type: Function, default: () => {} }
  },
  data() {
    return {
      username: null,
      password: null,
      error: ''
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle'])
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
        this.onLogin() // TODO change this to $emit
      } catch (err) {
        if (
          [
            'plugin.kuzzle-plugin-auth-passport-local.expired_password',
            'plugin.kuzzle-plugin-auth-passport-local.must_change_password'
          ].includes(err.id)
        ) {
          this.$router.push({
            name: 'ResetPassword',
            params: {
              showIntro: true,
              token: err.resetToken
            }
          })
        } else {
          this.error = err.message
        }
      }
    },
    async loginAsAnonymous() {
      this.error = ''
      this.$kuzzle.jwt = null
      try {
        await this.$store.direct.dispatch.auth.setSession('anonymous')
        await this.onLogin()
      } catch (error) {
        this.error = error.message
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped></style>
