<template>
  <form id="resetPasswordForm" method="post" @submit.prevent="resetPassword()">
    <div class="resetPasswordForm-inputs">
      <b-form-group
        label="New password"
        label-for="password"
        label-cols-sm="4"
        label-cols-md="3"
      >
        <b-form-input
          autofocus
          class="validate"
          data-cy="ResetPassword-password"
          id="password"
          name="password"
          required
          tabindex="1"
          type="password"
          v-model="password"
        />
      </b-form-group>

      <b-form-group
        description="Re-type the password for confirmation"
        label="Confirm password"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="password2"
      >
        <b-input
          class="validate"
          data-cy="ResetPassword-password2"
          id="password2"
          name="password2"
          required
          tabindex="2"
          type="password"
          v-model="password2"
        />
      </b-form-group>

      <div class="ResetPasswordForm-error" v-if="error">
        <b-alert variant="danger" show dismissible>
          Error: {{ error }}
        </b-alert>
      </div>

      <div class="ResetPasswordForm-buttons float-right mt-3">
        <b-button
          variant="primary"
          data-cy="ResetPassword-submitBtn"
          type="submit"
          name="action"
          tabindex="3"
          >Send</b-button
        >
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ResetPasswordForm',
  props: {
    resetToken: String
  },
  data() {
    return {
      error: '',
      password: '',
      password2: ''
    }
  },
  methods: {
    async resetPassword() {
      this.error = ''

      if (this.password.trim() === '' || this.password2.trim() === '') {
        this.error = 'All fields are mandatory'
        return
      }

      if (this.password !== this.password2) {
        this.error = 'Passwords do not match'
        return
      }

      try {
        await this.$store.direct.dispatch.auth.doResetPassword({
          password: this.password,
          token: this.$route.params.token
        })
        this.$emit('reset-password::after')
      } catch (error) {
        this.error = error.message
      }
    }
  }
}
</script>
