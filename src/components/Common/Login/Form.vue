<template>
  <form id="loginForm" method="post" @submit.prevent="login()">
    <div class="loginForm-inputs">
      <b-form-group label="Login" label-for="username" label-cols-sm="4" label-cols-lg="3">
        <b-form-input
          id="username"
          v-model="username"
          autofocus
          class="validate"
          data-cy="Login-username"
          name="username"
          required
          tabindex="1"
          type="text"
        />
      </b-form-group>
      <b-form-group label="Password" label-for="pass" label-cols-sm="4" label-cols-lg="3">
        <b-form-input
          id="pass"
          v-model="password"
          data-cy="Login-password"
          type="password"
          name="password"
          required
          tabindex="2"
          class="validate"
        />
      </b-form-group>
    </div>

    <div v-if="error" class="LoginForm-error">
      <b-alert variant="danger" show dismissible> Login failed: {{ error }} </b-alert>
    </div>

    <div class="LoginForm-buttons">
      <div class="d-flex flex-column align-items-center w-100 gap-3">
        <div class="w-100 d-flex justify-content-center mt-2">
          <b-button
            class="w-100"
            variant="primary"
            data-cy="Login-submitBtn"
            type="submit"
            name="action"
            tabindex="3"
            >Login</b-button
          >
        </div>

        <div
          v-for="strategy in strategies"
          v-bind:key="strategy"
          class="w-100 d-flex justify-content-center mt-2"
        >
          <b-button
            v-bind:key="strategy"
            class="w-100"
            variant="primary"
            data-cy="Login-submitBtn-strategy"
            name="action"
            @click="loginWithStrategy(strategy)"
            tabindex="4"
            >Login with {{ strategy }}</b-button
          >
        </div>

        <div class="w-100 d-flex justify-content-center mt-2">
          <b-button
            class="w-100"
            data-cy="LoginAsAnonymous-Btn"
            variant="primary"
            @click="loginAsAnonymous"
            >Login as Anonymous</b-button
          >
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import { mapState } from 'pinia';

import Focus from '@/directives/focus.directive';
import { useAuthStore, useKuzzleStore } from '@/stores';

export default {
  name: 'LoginForm',
  directives: {
    Focus,
  },
  props: {
    onLogin: { type: Function, default: () => {} },
  },
  setup() {
    return {
      authStore: useAuthStore(),
    };
  },
  data() {
    return {
      username: null,
      password: null,
      error: '',
      strategies: ['keycloak'],
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
  },
  methods: {
    dismissError() {
      this.error = '';
    },
    async login() {
      this.error = '';
      try {
        await this.authStore.doLogin({
          username: this.username,
          password: this.password,
        });

        this.onLogin(); // TODO change this to $emit
      } catch (err) {
        if (
          [
            'plugin.kuzzle-plugin-auth-passport-local.expired_password',
            'plugin.kuzzle-plugin-auth-passport-local.must_change_password',
          ].includes(err.id)
        ) {
          this.$router.push({
            name: 'ResetPassword',
            params: {
              showIntro: true,
              token: err.resetToken,
            },
          });
        } else {
          this.error = err.message;
        }
      }
    },
    async loginAsAnonymous() {
      this.error = '';
      this.$kuzzle.jwt = null;
      try {
        await this.authStore.setSession('anonymous');
        await this.onLogin();
      } catch (error) {
        this.error = error.message;
      }
    },

    async loginWithStrategy(strategy) {
      if (!strategy) {
        return;
      }

      if (strategy !== 'keycloak') {
        this.error = 'Strategy not supported yet.';
        return;
      }

      this.error = '';
      this.$kuzzle.jwt = null;

      try {
        const response = await this.$kuzzle.query({
          controller: 'auth',
          action: 'login',
          strategy: 'keycloak',
        });

        localStorage.setItem('openid-sessionId', response.headers.keycloak);
        window.location.href = response.headers.location;
      } catch (error) {
        this.error = error.message;
        localStorage.removeItem('openid-sessionId');
      }
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss" scoped></style>
