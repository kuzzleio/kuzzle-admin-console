<template>
  <div class="LoginPage tw:flex tw:min-h-screen tw:items-center tw:justify-center tw:p-4">
    <Card class="tw:w-full tw:max-w-2xl">
      <CardContent>
        <div class="tw:text-center">
          <img
            src="../assets/logo.svg"
            alt="Welcome to the Kuzzle Admin Console"
            class="tw:mb-8 tw:inline-block tw:h-auto tw:max-w-full"
          />
        </div>
        <Alert
          v-if="displayNoAdminWarning"
          class="tw:mb-4 tw:text-center"
          data-cy="noAdminWarning"
          variant="warning"
        >
          <b>Warning!</b> Your Kuzzle has no administrator user. It is strongly recommended
          <a class="tw:font-semibold tw:underline" data-cy="NoAdminWarning-link" href="#/signup">
            that you create one.</a
          >
        </Alert>

        <!--
          `<b-form-group label="Connected to">` rendait un libellé sans champ
          associé : `environment-switch` est un menu, pas un contrôle de
          formulaire. Le mot reste, en texte, et le menu porte son propre nom
          accessible.
        -->
        <div class="tw:mb-4 tw:flex tw:flex-wrap tw:items-center tw:gap-3">
          <span class="tw:text-sm tw:text-muted-foreground">Connected to</span>
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
