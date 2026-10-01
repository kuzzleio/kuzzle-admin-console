<template>
  <div class="Signup h-screen overflow-y-auto">
    <div class="Signup-flexContainer mx-auto flex max-w-4xl justify-center p-4">
      <Card class="my-3 w-full shadow-signature">
        <CardContent class="flex flex-col gap-4">
          <!--
            `b-jumbotron` n'était qu'un bloc gris à gros titre. Il disparaît
            avec Bootstrap : l'en-tête est du balisage ordinaire, et le
            séparateur un `<hr>` aux tokens. Le bloc gris qui le remplaçait
            part aussi : comme sur les pages de connexion, le titre en Gobold et
            le filet de la carte signature portent la marque (E-24).
          -->
          <header>
            <KuzzleLogo alt="Welcome to the Kuzzle Admin Console" height="60" class="h-15 w-auto" />
            <h2 class="mt-4 font-display text-display font-bold uppercase text-foreground">
              Create an Admin Account
            </h2>

            <p class="mt-4 text-foreground">
              Your Kuzzle instance does not seem to have an administrator user. To continue using an
              insecure installation and skip the Admin Account creation, click the "Login as
              Anonymous" button below.
            </p>

            <hr class="my-6 border-border" />

            <div class="flex flex-wrap items-center justify-end gap-3">
              <span class="text-sm text-muted-foreground">Connected to</span>
              <environment-switch
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </div>
          </header>

          <Alert v-if="error" variant="destructive">{{ error }}</Alert>

          <FormItem>
            <Label for="username">Username</Label>
            <Input
              id="username"
              v-model="username"
              data-cy="Signup-username"
              name="username"
              required
              type="text"
            />
            <FormDescription>
              The name of the user that will administrate this instance
            </FormDescription>
          </FormItem>

          <FormItem>
            <Label for="pass1">Password</Label>
            <Input
              id="pass1"
              v-model="password1"
              data-cy="Signup-password1"
              name="password1"
              required
              type="password"
            />
            <FormDescription>Manage to choose a strong one</FormDescription>
          </FormItem>

          <FormItem>
            <Label for="pass2">Confirm password</Label>
            <Input
              id="pass2"
              v-model="password2"
              data-cy="Signup-password2"
              name="password2"
              required
              type="password"
            />
            <FormDescription>Re-type the password for confirmation</FormDescription>
          </FormItem>

          <Alert variant="info">
            <i class="fa fa-exclamation-triangle" aria-hidden="true" /> To secure your Kuzzle
            installation we recommend you select the “Remove anonymous user credentials” checkbox
            below.
          </Alert>

          <FormItem>
            <div class="flex items-center gap-2">
              <Checkbox id="reset" v-model="reset" />
              <Label class="text-ui font-normal normal-case text-foreground" for="reset"
                >Remove anonymous user credentials.</Label
              >
            </div>
            <FormDescription>
              This will avoid non-authenticated users to perform operations on this instance.
            </FormDescription>
          </FormItem>
        </CardContent>

        <CardFooter class="flex flex-wrap justify-end gap-2">
          <!--
            Ce bouton portait `data-cy="LoginAsAnonymous-Btn"`, le même que son
            voisin : deux éléments pour un sélecteur, et `cy.get()` aurait
            échoué le jour où une spec l'aurait visé ici. Les deux appels de
            `login.spec.js` visent celui de l'écran de connexion.
          -->
          <Button
            data-cy="Signup-goToLoginBtn"
            variant="link"
            @click="$router.push({ name: 'Login' })"
            >Go to Login Page</Button
          >
          <Button data-cy="LoginAsAnonymous-Btn" variant="link" @click="loginAsGuest"
            >Login as Anonymous</Button
          >
          <Button data-cy="Signup-submitBtn" :disabled="waiting" type="submit" @click="signup">
            Create Admin Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/composables/useToast';
import { caught } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useAuthStore, useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch.vue';
import KuzzleLogo from './Common/KuzzleLogo.vue';

const emit = defineEmits<{
  (e: 'environment::create', id?: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const router = useRouter();
const toast = useToast();

const username = ref('');
const password1 = ref('');
const password2 = ref('');
const reset = ref(false);
const error = ref<string | null>(null);
const waiting = ref(false);

async function signup(): Promise<void> {
  if (username.value === '' || password1.value === '' || password2.value === '') {
    error.value = 'All fields are mandatory';
    return;
  }

  if (password1.value !== password2.value) {
    error.value = 'Confirmation does not match password';
    return;
  }

  error.value = null;
  waiting.value = true;

  try {
    await kuzzleStore.$kuzzle?.query({
      controller: 'security',
      action: 'createFirstAdmin',
      _id: username.value,
      reset: reset.value,
      body: {
        content: {},
        credentials: {
          local: {
            username: username.value,
            password: password1.value,
          },
        },
      },
    });

    kuzzleStore.updateTokenCurrentEnvironment(null);
    authStore.adminAlreadyExists = true;
    router.push({ name: 'Login' });
  } catch (err) {
    const { id, message } = caught(err);
    if (
      [
        'plugin.kuzzle-plugin-auth-passport-local.login_in_password',
        'plugin.kuzzle-plugin-auth-passport-local.weak_password',
      ].includes(id ?? '')
    ) {
      error.value = message;
    } else {
      logger.error(err);
      toast.danger(message, 'The complete error has been printed to the console.');
    }
  }
  waiting.value = false;
}

function loginAsGuest(): void {
  error.value = null;
  authStore
    .setSession('anonymous')
    .then(() => {
      // `go()` prend un nombre : l'objet que recevait `$router.go` valait 0,
      // soit un rechargement qui laissait sur cette page (G-112).
      router.push({ name: 'Data' });
    })
    .catch((err: unknown) => {
      error.value = caught(err).message;
    });
}

function editEnvironment(id?: string): void {
  emit('environment::create', id);
}

function deleteEnvironment(id: string): void {
  emit('environment::delete', id);
}

function importEnv(): void {
  emit('environment::importEnv');
}
</script>
