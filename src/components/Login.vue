<template>
  <div class="LoginPage flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-2xl">
      <CardContent>
        <div class="text-center">
          <img
            src="../assets/logo.svg"
            alt="Welcome to the Kuzzle Admin Console"
            class="mb-8 inline-block h-auto max-w-full"
          />
        </div>
        <Alert
          v-if="displayNoAdminWarning"
          class="mb-4 text-center"
          data-cy="noAdminWarning"
          variant="info"
        >
          <b>Warning!</b> Your Kuzzle has no administrator user. It is strongly recommended
          <a class="font-semibold underline" data-cy="NoAdminWarning-link" href="#/signup">
            that you create one.</a
          >
        </Alert>

        <!--
          `<b-form-group label="Connected to">` rendait un libellé sans champ
          associé : `environment-switch` est un menu, pas un contrôle de
          formulaire. Le mot reste, en texte, et le menu porte son propre nom
          accessible.
        -->
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <span class="text-sm text-muted-foreground">Connected to</span>
          <environment-switch
            @environment::create="editEnvironment"
            @environment::delete="deleteEnvironment"
            @environment::importEnv="importEnv"
          />
        </div>

        <login-form :on-login="onLogin" />
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore, useKuzzleStore, useRoutingStore } from '@/stores';

import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch.vue';
import LoginForm from './Common/Login/Form.vue';

export default {
  name: 'Login',
  components: {
    Alert,
    Card,
    CardContent,
    EnvironmentSwitch,
    LoginForm,
  },
  setup() {
    return {
      authStore: useAuthStore(),
      routingStore: useRoutingStore(),
    };
  },
  data() {
    return {
      environmentId: null,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['currentEnvironment']),
    displayNoAdminWarning() {
      return !this.authStore.adminAlreadyExists;
    },
  },
  methods: {
    onLogin() {
      // Set the body overflow to visible because the login modal set it to 'hidden'.
      // After login, the index route is pushed to view router and the body overflow is
      // not set to his original state
      // see src/components/Materialize/Modale.vue#62
      window.document.body.style.overflow = 'visible';

      if (this.routingStore.routeBeforeRedirect) {
        const route = this.routingStore.routeBeforeRedirect;
        this.routingStore.routeBeforeRedirect = undefined;

        this.$router.push({
          name: route,
        });
      } else {
        this.$router.push('/');
      }
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
