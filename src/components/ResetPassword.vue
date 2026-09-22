<template>
  <div class="ResetPassword flex min-h-screen items-center justify-center p-4">
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
          v-if="showIntro"
          class="mb-4 text-center"
          data-cy="resetPasswordAlert"
          variant="warning"
        >
          <b>Warning!</b> You must update your password to continue
        </Alert>

        <reset-password-form :reset-token="token" @reset-password::after="onReset" />
      </CardContent>
    </Card>
  </div>
</template>

<script>
import { Alert } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useRoutingStore } from '@/stores';

import ResetPasswordForm from './Common/Login/ResetPasswordForm.vue';

export default {
  name: 'ResetPassword',
  components: {
    Alert,
    Card,
    CardContent,
    ResetPasswordForm,
  },
  props: {
    showIntro: Boolean,
    token: String,
  },
  setup() {
    return {
      routingStore: useRoutingStore(),
    };
  },
  methods: {
    onReset() {
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
  },
};
</script>
