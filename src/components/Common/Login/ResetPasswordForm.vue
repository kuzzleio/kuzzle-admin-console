<template>
  <form id="resetPasswordForm" method="post" @submit.prevent="resetPassword()">
    <div class="resetPasswordForm-inputs">
      <b-form-group
        data-cy="ResetPassword-password--group"
        invalid-feedback="Password must not be empty"
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
          pattern=".*[^ ].*"
          required
          tabindex="1"
          type="password"
          v-model="$v.password.$model"
          :state="validateState('password')"
        />
      </b-form-group>

      <b-form-group
        data-cy="ResetPassword-password2--group"
        description="Re-type the password for confirmation"
        label="Confirm password"
        label-cols-sm="4"
        label-cols-lg="3"
        label-for="password2"
        :invalid-feedback="password2Feedback"
      >
        <b-input
          class="validate"
          data-cy="ResetPassword-password2"
          id="password2"
          name="password2"
          required
          tabindex="2"
          type="password"
          v-model="$v.password2.$model"
          :pattern="password2Pattern"
          :state="validateState('password2')"
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
import { validationMixin } from 'vuelidate' ;
import { required, sameAs } from 'vuelidate/lib/validators' ;

export default {
  mixins: [validationMixin],
  name: 'ResetPasswordForm',
  props: {
    resetToken: String
  },
  data() {
    return {
      error: '',
      password: '',
      password2: ''
    } ;
  },
  validations: {
    password: {
      required
    },
    password2: {
      required,
      sameAs: sameAs('password')
    }
  },
  computed: {
    password2Feedback() {
      if (!this.$v.password2.sameAs) {
        return 'Passwords do not match' ;
      }
      if (!this.$v.password2.required) {
        return 'Password must not be empty' ;
      }

      return null ;
    },
    password2Pattern() {
      // html validation pattern use regular expressions
      // We need to escape special chars to match against the password field
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
      return this.password.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
    }
  },
  methods: {
    validateState(fieldName) {
      const { $dirty, $error } = this.$v[fieldName] ;
      const state = $dirty ? !$error : null ;

      return state ;
    },
    async resetPassword() {
      this.error = '' ;

      try {
        await this.$store.direct.dispatch.auth.doResetPassword({
          password: this.password,
          token: this.resetToken
        }) ;
        this.$emit('reset-password::after')
      } catch (error) {
        this.error = error.message ;
      }
    }
  }
} ;
</script>
