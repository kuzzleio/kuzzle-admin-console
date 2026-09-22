<template>
  <form id="resetPasswordForm" method="post" @submit.prevent="resetPassword()">
    <div class="resetPasswordForm-inputs flex flex-col gap-4">
      <FormItem data-cy="ResetPassword-password--group">
        <Label for="password">New password</Label>
        <Input
          id="password"
          v-model="v$.password.$model"
          v-focus
          :aria-invalid="passwordFeedback ? 'true' : undefined"
          data-cy="ResetPassword-password"
          name="password"
          pattern=".*[^ ].*"
          required
          tabindex="1"
          type="password"
        />
        <FormMessage v-if="passwordFeedback">{{ passwordFeedback }}</FormMessage>
      </FormItem>

      <FormItem data-cy="ResetPassword-password2--group">
        <Label for="password2">Confirm password</Label>
        <Input
          id="password2"
          v-model="v$.password2.$model"
          :aria-invalid="password2Feedback ? 'true' : undefined"
          data-cy="ResetPassword-password2"
          name="password2"
          :pattern="password2Pattern"
          required
          tabindex="2"
          type="password"
        />
        <FormDescription>Re-type the password for confirmation</FormDescription>
        <FormMessage v-if="password2Feedback">{{ password2Feedback }}</FormMessage>
      </FormItem>

      <div v-if="error" class="ResetPasswordForm-error">
        <Alert class="flex items-start gap-3" variant="destructive">
          <span class="flex-1">Error: {{ error }}</span>
          <button
            aria-label="Dismiss"
            class="cursor-pointer leading-none"
            type="button"
            @click="error = ''"
          >
            <i class="fa fa-times" aria-hidden="true" />
          </button>
        </Alert>
      </div>

      <div class="ResetPasswordForm-buttons flex justify-end">
        <Button data-cy="ResetPassword-submitBtn" name="action" tabindex="3" type="submit"
          >Send</Button
        >
      </div>
    </div>
  </form>
</template>

<script>
import { useVuelidate } from '@vuelidate/core';
import { sameAs, required, helpers } from '@vuelidate/validators';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Focus from '@/directives/focus.directive';
import { useAuthStore } from '@/stores';

export default {
  name: 'ResetPasswordForm',
  components: {
    Alert,
    Button,
    FormDescription,
    FormItem,
    FormMessage,
    Input,
    Label,
  },
  directives: {
    Focus,
  },
  props: {
    resetToken: String,
  },
  setup() {
    return {
      v$: useVuelidate(),
      authStore: useAuthStore(),
    };
  },
  data() {
    return {
      error: '',
      password: '',
      password2: '',
    };
  },
  validations: {
    password: {
      required: helpers.withMessage('Password must not be empty', required),
    },
    password2: {
      required: helpers.withMessage('Password must not be empty', required),
      sameAs: helpers.withMessage('Passwords do not match', sameAs('password')),
    },
  },
  computed: {
    passwordFeedback() {
      if (this.v$.password.$errors.length > 0) {
        return this.v$.password.$errors[0].$message;
      }

      return null;
    },
    password2Feedback() {
      if (this.v$.password2.$errors.length > 0) {
        return this.v$.password2.$errors[0].$message;
      }

      return null;
    },
    password2Pattern() {
      // html validation pattern use regular expressions
      // We need to escape special chars to match against the password field
      // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
      return this.password.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    },
  },
  methods: {
    async resetPassword() {
      this.error = '';

      try {
        await this.authStore.doResetPassword({
          password: this.password,
          token: this.resetToken,
        });

        this.$emit('reset-password::after');
      } catch (error) {
        this.error = error.message;
      }
    },
  },
};
</script>
