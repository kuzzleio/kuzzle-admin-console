<template>
  <div class="LoginPage flex min-h-screen items-center justify-center p-4">
    <Card class="w-full max-w-2xl shadow-signature">
      <CardContent>
        <div class="text-center">
          <KuzzleLogo
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

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore, useRoutingStore } from '@/stores';

import EnvironmentSwitch from './Common/Environments/EnvironmentsSwitch.vue';
import LoginForm from './Common/Login/Form.vue';
import KuzzleLogo from './Common/KuzzleLogo.vue';

const emit = defineEmits<{
  (e: 'environment::create', id: string): void;
  (e: 'environment::delete', id: string): void;
  (e: 'environment::importEnv'): void;
}>();

const authStore = useAuthStore();
const routingStore = useRoutingStore();
const router = useRouter();

const displayNoAdminWarning = computed(() => !authStore.adminAlreadyExists);

function onLogin(): void {
  // Set the body overflow to visible because the login modal set it to 'hidden'.
  // After login, the index route is pushed to view router and the body overflow is
  // not set to his original state
  // see src/components/Materialize/Modale.vue#62
  window.document.body.style.overflow = 'visible';

  if (routingStore.routeBeforeRedirect) {
    const route = routingStore.routeBeforeRedirect;
    routingStore.routeBeforeRedirect = undefined;

    router.push({
      name: route,
    });
  } else {
    router.push('/');
  }
}

function editEnvironment(id: string): void {
  emit('environment::create', id);
}

function deleteEnvironment(id: string): void {
  emit('environment::delete', id);
}

function importEnv(): void {
  emit('environment::importEnv');
}
</script>
