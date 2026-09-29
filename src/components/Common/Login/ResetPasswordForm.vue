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

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { sameAs, required, helpers } from '@vuelidate/validators';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import vFocus from '@/directives/focus.directive';
import { caught } from '@/lib/errors';
import { useAuthStore } from '@/stores';

const props = defineProps<{
  resetToken?: string;
}>();

const emit = defineEmits<{
  (e: 'reset-password::after'): void;
}>();

const authStore = useAuthStore();

const error = ref('');
const form = reactive({ password: '', password2: '' });

// `sameAs` de Vuelidate 2 compare à une valeur, pas à un nom de champ : il
// reçoit un `computed` pour suivre le mot de passe saisi (G-102).
const rules = computed(() => ({
  password: {
    required: helpers.withMessage('Password must not be empty', required),
  },
  password2: {
    required: helpers.withMessage('Password must not be empty', required),
    sameAs: helpers.withMessage('Passwords do not match', sameAs(form.password)),
  },
}));

const v$ = useVuelidate(rules, form);

function firstError(field: 'password' | 'password2'): string | null {
  const errors = v$.value[field].$errors;
  return errors.length > 0 ? String(errors[0].$message) : null;
}

const passwordFeedback = computed(() => firstError('password'));
const password2Feedback = computed(() => firstError('password2'));
// html validation pattern use regular expressions
// We need to escape special chars to match against the password field
// taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
const password2Pattern = computed(() => form.password.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'));

async function resetPassword(): Promise<void> {
  error.value = '';

  try {
    await authStore.doResetPassword({
      password: form.password,
      token: props.resetToken,
    });

    emit('reset-password::after');
  } catch (err) {
    error.value = caught(err).message;
  }
}
</script>
