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

          <reset-password-form
            :reset-token="token"
            @reset-password::after="onReset"
          />
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<style type="text/css" scoped>
.ResetPassword {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script>
import ResetPasswordForm from './Common/Login/ResetPasswordForm.vue'

export default {
  name: 'ResetPassword',
  props: {
    showIntro: Boolean,
    token: String
  },
  components: {
    ResetPasswordForm
  },
  methods: {
    onReset() {
      if (this.$store.getters.routeBeforeRedirect) {
        this.$store.direct.commit.routing.setRouteBeforeRedirect(undefined)
        this.$router.push({ name: this.$store.getters.routeBeforeRedirect })
      } else {
        this.$router.push('/')
      }
    }
  }
}
</script>
