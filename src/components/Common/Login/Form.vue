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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

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
import vFocus from '@/directives/focus.directive';
import { caught } from '@/lib/errors';
import { useAuthStore, useKuzzleStore } from '@/stores';

const props = withDefaults(
  defineProps<{
    onLogin?: () => void | Promise<void>;
  }>(),
  { onLogin: () => {} },
);

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const error = ref('');
const strategies = ['keycloak'];
const availableStrategies = ref<string[]>([]);

function dismissError(): void {
  error.value = '';
}

async function login(): Promise<void> {
  error.value = '';
  try {
    await authStore.doLogin({
      username: username.value,
      password: password.value,
    });

    props.onLogin(); // TODO change this to $emit
  } catch (err) {
    const { field, id, message } = caught(err);
    if (
      [
        'plugin.kuzzle-plugin-auth-passport-local.expired_password',
        'plugin.kuzzle-plugin-auth-passport-local.must_change_password',
      ].includes(id ?? '')
    ) {
      // `showIntro` passe en query : vue-router 4 écarte un paramètre
      // absent du chemin, et l'avertissement ne s'affichait plus (G-104).
      router.push({
        name: 'ResetPassword',
        params: { token: String(field('resetToken')) },
        query: { showIntro: 'true' },
      });
    } else {
      error.value = message;
    }
  }
}

async function loginAsAnonymous(): Promise<void> {
  error.value = '';
  if (kuzzleStore.$kuzzle) {
    kuzzleStore.$kuzzle.jwt = null;
  }
  try {
    await authStore.setSession('anonymous');
    await props.onLogin();
  } catch (err) {
    error.value = caught(err).message;
  }
}

async function loadAvailableStrategies(): Promise<void> {
  const available: string[] = [];

  await Promise.all(
    strategies.map(async (strategy) => {
      try {
        await kuzzleStore.$kuzzle?.query({
          controller: strategy,
          action: 'getVersion',
        });

        available.push(strategy);
      } catch (err) {
        console.error('error in getversion', err);
        console.error(
          `You either miss the getVersion from the ${strategy} controller, or the strategy does not implement the "connect with" on this console, in that case, you should use the local strategy`,
        );
        // Ignore strategies whose plugin controller is not available.
        available.push(strategy);
      }
    }),
  );

  availableStrategies.value = available;
}

async function loginWithStrategy(strategy: string): Promise<void> {
  if (!strategy) {
    return;
  }

  error.value = '';
  if (kuzzleStore.$kuzzle) {
    kuzzleStore.$kuzzle.jwt = null;
  }

  try {
    const response = await kuzzleStore.$kuzzle?.query({
      controller: 'auth',
      action: 'login',
      strategy,
      body: {
        redirectUri: globalThis.location.origin,
      },
    });

    // Les en-têtes de la réponse d'une stratégie OpenID ne sont pas dans le
    // type du SDK : ils sont lus tels quels, et un absent vaut `'undefined'`,
    // comme avant.
    const headers =
      response && 'headers' in response && typeof response.headers === 'object'
        ? (response.headers ?? {})
        : {};
    localStorage.setItem('openid-sessionId', String(Reflect.get(headers, strategy)));
    globalThis.location.href = String(Reflect.get(headers, 'location'));
  } catch (err) {
    error.value = caught(err).message;
    localStorage.removeItem('openid-sessionId');
  }
}

onMounted(() => {
  loadAvailableStrategies();
});
</script>
