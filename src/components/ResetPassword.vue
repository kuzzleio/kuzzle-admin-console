<template>
  <div class="ResetPassword">
    <b-row align-h="center" class="w-100">
      <b-col xl="6" lg="7" md="8" sm="10">
        <b-card>
          <b-card-body>
            <div class="text-center">
              <img
                src="../assets/logo.svg"
                alt="Welcome to the Kuzzle Admin Console"
                class="mb-5 img-fluid"
              />
            </div>

            <b-alert
              class="text-center"
              variant="warning"
              data-cy="resetPasswordAlert"
              :show="showIntro"
            >
              <b>Warning!</b> You must update your password to continue
            </b-alert>
          </b-card-body>

          <reset-password-form :reset-token="token" @reset-password::after="onReset" />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import { useRoutingStore } from '@/stores';

import ResetPasswordForm from './Common/Login/ResetPasswordForm.vue';

export default {
  name: 'ResetPassword',
  components: {
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

<style type="text/css" scoped>
.ResetPassword {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
