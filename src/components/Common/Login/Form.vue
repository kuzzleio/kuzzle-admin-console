<template>
  <form id="loginForm" method="post" @submit.prevent="login()">
    <div class="loginForm-inputs flex flex-col gap-4">
      <FormItem>
        <Label for="username">Login</Label>
        <Input
          id="username"
          v-model="username"
          v-focus
          data-cy="Login-username"
          name="username"
          required
          tabindex="1"
          type="text"
        />
      </FormItem>

      <FormItem>
        <Label for="pass">Password</Label>
        <Input
          id="pass"
          v-model="password"
          data-cy="Login-password"
          name="password"
          required
          tabindex="2"
          type="password"
        />
      </FormItem>
    </div>

    <!--
      `b-alert dismissible` posait sa propre croix ; la primitive `Alert` n'en
      rend pas. Le bouton est écrit ici, et il appelle `dismissError()`, qui
      existait déjà sans être branché à rien.
    -->
    <div v-if="error" class="LoginForm-error mt-4">
      <Alert class="flex items-start gap-3" variant="destructive">
        <span class="flex-1">Login failed: {{ error }}</span>
        <button
          aria-label="Dismiss"
          class="cursor-pointer leading-none"
          type="button"
          @click="dismissError"
        >
          <i class="fa fa-times" aria-hidden="true" />
        </button>
      </Alert>
    </div>

    <div class="LoginForm-buttons mt-4 flex flex-wrap items-center justify-end gap-2">
      <Button data-cy="LoginAsAnonymous-Btn" variant="link" @click="loginAsAnonymous"
        >Login as Anonymous</Button
      >

      <DropdownMenu v-if="availableStrategies.length">
        <DropdownMenuTrigger
          :as="Button"
          data-cy="Login-submitBtn-strategy"
          tabindex="4"
          variant="outline"
        >
          Login with
          <i aria-hidden="true" class="fas fa-caret-down" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="strategy in availableStrategies"
            :key="strategy"
            :data-cy="`Login-submitBtn-strategy-${strategy}`"
            @select="loginWithStrategy(strategy)"
          >
            {{ strategy }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button data-cy="Login-submitBtn" name="action" tabindex="3" type="submit">Login</Button>
    </div>
  </form>
</template>

<script>
import { markRaw } from 'vue';
import { mapState } from 'pinia';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Focus from '@/directives/focus.directive';
import { useAuthStore, useKuzzleStore } from '@/stores';

export default {
  name: 'LoginForm',
  components: {
    Alert,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    FormItem,
    Input,
    Label,
  },
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
      /*
       * `DropdownMenuTrigger` prend le composant en prop `as`, pas son nom.
       * `markRaw` et non `Object.freeze` : Vue met en cache le constructeur
       * sur les options du composant, et un objet gelé le lui interdit
       * (G-032).
       */
      Button: markRaw(Button),
      username: null,
      password: null,
      error: '',
      strategies: ['keycloak'],
      availableStrategies: [],
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
  },
  mounted() {
    this.loadAvailableStrategies();
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

    async loadAvailableStrategies() {
      const availableStrategies = [];

      await Promise.all(
        this.strategies.map(async (strategy) => {
          try {
            await this.$kuzzle.query({
              controller: strategy,
              action: 'getVersion',
            });

            availableStrategies.push(strategy);
          } catch (error) {
            console.error('error in getversion', error);
            console.error(
              `You either miss the getVersion from the ${strategy} controller, or the strategy does not implement the "connect with" on this console, in that case, you should use the local strategy`,
            );
            // Ignore strategies whose plugin controller is not available.
            availableStrategies.push(strategy);
          }
        }),
      );

      this.availableStrategies = availableStrategies;
    },

    async loginWithStrategy(strategy) {
      if (!strategy) {
        return;
      }

      this.error = '';
      this.$kuzzle.jwt = null;

      try {
        const response = await this.$kuzzle.query({
          controller: 'auth',
          action: 'login',
          strategy,
          body: {
            redirectUri: globalThis.location.origin,
          },
        });

        localStorage.setItem('openid-sessionId', response.headers[strategy]);
        globalThis.location.href = response.headers.location;
      } catch (error) {
        this.error = error.message;
        localStorage.removeItem('openid-sessionId');
      }
    },
  },
};
</script>
