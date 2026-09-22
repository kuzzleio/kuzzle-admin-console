<template>
  <div class="Signup tw:h-screen tw:overflow-y-auto">
    <div class="Signup-flexContainer tw:mx-auto tw:flex tw:max-w-4xl tw:justify-center tw:p-4">
      <Card class="tw:my-3 tw:w-full">
        <CardContent class="tw:flex tw:flex-col tw:gap-4">
          <!--
            `b-jumbotron` n'était qu'un bloc gris à gros titre. Il disparaît
            avec Bootstrap : l'en-tête est du balisage ordinaire, et le
            séparateur un `<hr>` aux tokens.
          -->
          <header class="tw:rounded-md tw:bg-muted tw:p-8">
            <img
              src="../assets/logo.svg"
              alt="Welcome to the Kuzzle Admin Console"
              height="60"
              class="tw:h-15 tw:w-auto"
            />
            <h2 class="tw:mt-4 tw:text-2xl tw:font-bold tw:text-foreground">
              Create an Admin Account
            </h2>

            <p class="tw:mt-4 tw:text-foreground">
              Your Kuzzle instance does not seem to have an administrator user. To continue using an
              insecure installation and skip the Admin Account creation, click the "Login as
              Anonymous" button below.
            </p>

            <hr class="tw:my-6 tw:border-border" />

            <div class="tw:flex tw:flex-wrap tw:items-center tw:justify-end tw:gap-3">
              <span class="tw:text-sm tw:text-muted-foreground">Connected to</span>
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

          <Alert variant="warning">
            <i class="fa fa-exclamation-triangle" aria-hidden="true" /> To secure your Kuzzle
            installation we recommend you select the “Remove anonymous user credentials” checkbox
            below.
          </Alert>

          <FormItem>
            <div class="tw:flex tw:items-center tw:gap-2">
              <Checkbox id="reset" v-model="reset" />
              <Label for="reset">Remove anonymous user credentials.</Label>
            </div>
            <FormDescription>
              This will avoid non-authenticated users to perform operations on this instance.
            </FormDescription>
          </FormItem>
        </CardContent>

        <CardFooter class="tw:flex tw:flex-wrap tw:justify-end tw:gap-2">
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

<script>
import { mapState } from 'pinia';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch.vue';

export default {
  name: 'Signup',
  components: {
    Alert,
    Button,
    Card,
    CardContent,
    CardFooter,
    Checkbox,
    EnvironmentSwitch,
    FormDescription,
    FormItem,
    Input,
    Label,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      kuzzleStore: useKuzzleStore(),
    };
  },
  data() {
    return {
      username: '',
      password1: '',
      password2: '',
      reset: false,
      error: null,
      waiting: false,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
  },
  methods: {
    async signup() {
      if (this.username === '' || this.password1 === '' || this.password2 === '') {
        this.error = 'All fields are mandatory';
        return;
      }

      if (this.password1 !== this.password2) {
        this.error = 'Confirmation does not match password';
        return;
      }

      this.error = null;
      this.waiting = true;

      try {
        await this.$kuzzle.query({
          controller: 'security',
          action: 'createFirstAdmin',
          _id: this.username,
          reset: this.reset,
          body: {
            content: {},
            credentials: {
              local: {
                username: this.username,
                password: this.password1,
              },
            },
          },
        });

        this.kuzzleStore.updateTokenCurrentEnvironment(null);
        this.authStore.adminAlreadyExists = true;
        this.$router.push({ name: 'Login' });
      } catch (err) {
        if (
          [
            'plugin.kuzzle-plugin-auth-passport-local.login_in_password',
            'plugin.kuzzle-plugin-auth-passport-local.weak_password',
          ].includes(err.id)
        ) {
          this.error = err.message;
        } else {
          this.$log.error(err);
          this.$toast.danger(err.message, 'The complete error has been printed to the console.');
        }
      }
      this.waiting = false;
    },
    loginAsGuest() {
      this.error = null;
      this.authStore
        .setSession('anonymous')
        .then(() => {
          this.$router.go({ name: 'Data' });
        })
        .catch((err) => {
          this.error = err.message;
        });
    },
    editEnvironment(id) {
      this.$emit('environment::create', id);
    },
    deleteEnvironment(id) {
      this.$emit('environment::delete', id);
    },
    importEnv() {
      this.$emit('environment::importEnv');
    },
  },
};
</script>
