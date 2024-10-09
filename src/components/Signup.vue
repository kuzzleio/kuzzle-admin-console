<template>
  <div class="Signup">
    <b-container class="Signup-flexContainer">
      <b-card class="my-3">
        <b-jumbotron class="p-5">
          <template #header>
            <img src="../assets/logo.svg" alt="Welcome to the Kuzzle Admin Console" height="60" />
            <h2>Create an Admin Account</h2>
          </template>
          Your Kuzzle instance does not seem to have an administrator user. To continue using an
          insecure installation and skip the Admin Account creation, click the "Login as Anonymous"
          button below.

          <hr class="my-4" />

          <b-row align-v="center">
            <b-col sm="10" class="text-right">
              <span class="text-muted align-middle">Connected to</span>
            </b-col>
            <b-col sm="2" class="text-right">
              <environment-switch
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </b-col>
          </b-row>
        </b-jumbotron>
        <div class="text-center" />
        <b-alert variant="danger" :show="error">{{ error }}</b-alert>

        <b-form-group
          description="The name of the user that will administrate this instance"
          label="Username"
          label-cols-sm="4"
          label-cols-lg="3"
          label-for="username"
        >
          <b-input
            id="username"
            v-model="username"
            data-cy="Signup-username"
            type="text"
            name="username"
            required
          />
        </b-form-group>
        <b-form-group
          description="Manage to choose a strong one"
          label="Password"
          label-cols-sm="4"
          label-cols-lg="3"
          label-for="pass1"
        >
          <b-input
            id="pass1"
            v-model="password1"
            data-cy="Signup-password1"
            type="password"
            name="password1"
            required
          />
        </b-form-group>
        <b-form-group
          description="Re-type the password for confirmation"
          label="Confirm password"
          label-cols-sm="4"
          label-cols-lg="3"
          label-for="pass2"
        >
          <b-input
            id="pass2"
            v-model="password2"
            data-cy="Signup-password2"
            type="password"
            name="password2"
            required
          />
        </b-form-group>
        <b-alert show variant="info"
          ><i class="fa fa-exclamation-triangle" /> To secure your Kuzzle installation we recommend
          you select the “Remove anonymous user credentials” checkbox below.</b-alert
        >
        <b-form-group
          label="Remove anonymous user credentials."
          description="This will avoid non-authenticated users to perform operations on this instance."
          label-cols-sm="4"
          label-cols-lg="3"
        >
          <b-form-checkbox id="reset" v-model="reset" :value="true" :unchecked-value="false" />
        </b-form-group>

        <template #footer>
          <div class="text-right">
            <b-button
              class="mr-3"
              data-cy="LoginAsAnonymous-Btn"
              variant="link"
              @click="$router.push({ name: 'Login' })"
              >Go to Login Page</b-button
            >
            <b-button
              class="mr-3"
              data-cy="LoginAsAnonymous-Btn"
              variant="link"
              @click="loginAsGuest"
              >Login as Anonymous</b-button
            >
            <b-button
              data-cy="Signup-submitBtn"
              type="submit"
              variant="primary"
              :disabled="waiting"
              @click="signup"
            >
              Create Admin Account
            </b-button>
          </div>
        </template>
      </b-card>
    </b-container>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { useAuthStore, useKuzzleStore } from '@/stores';

import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch.vue';

export default {
  name: 'Signup',
  components: {
    EnvironmentSwitch,
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
          this.$bvToast.toast('The complete error has been printed to the console.', {
            title: err.message,
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
          });
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

<style type="text/css" scoped>
.Signup {
  overflow-y: auto;
  height: 100vh;
}
.Signup-flexContainer {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
