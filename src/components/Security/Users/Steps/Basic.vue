<template>
  <form class="wrapper flex flex-col gap-4">
    <FormItem data-cy="UserBasic-kuid">
      <Label for="custom-kuid"><strong>KUID</strong></Label>
      <Input
        id="custom-kuid"
        :aria-invalid="kuidFeedback ? 'true' : undefined"
        :disabled="!editKuid"
        placeholder="You can leave this field empty to let Kuzzle auto-generate the KUID"
        :model-value="kuid ?? undefined"
        type="text"
        @update:model-value="setCustomKuid"
      />
      <FormMessage v-if="kuidFeedback">{{ kuidFeedback }}</FormMessage>
    </FormItem>

    <FormItem>
      <Label><strong>Profiles</strong></Label>
      <UserProfileList
        :added-profiles="addedProfiles"
        @remove-profile="removeProfile"
        @selected-profile="onProfileSelected"
      />
      <div data-cy="UserProfileList-invalidFeedback">
        <FormMessage v-if="validations.addedProfiles.$error">
          Please add at least one profile
        </FormMessage>
      </div>
    </FormItem>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ErrorObject } from '@vuelidate/core';

import { FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import UserProfileList from './UserProfileList.vue';

/* Ce que l'étape lit de la validation du formulaire parent. */
interface BasicValidations {
  addedProfiles: { $error: boolean };
  kuid: { $errors: ErrorObject[] };
}

const props = withDefaults(
  defineProps<{
    addedProfiles?: string[];
    editKuid?: boolean;
    kuid?: string | null;
    validations: BasicValidations;
  }>(),
  { addedProfiles: () => [], editKuid: false, kuid: null },
);

const emit = defineEmits<{
  (e: 'profile-add', profile: string): void;
  (e: 'profile-remove', profile: string): void;
  (e: 'set-custom-kuid', value: string | number): void;
}>();

const kuidFeedback = computed(() => {
  if (props.validations.kuid.$errors.length > 0) {
    return props.validations.kuid.$errors[0].$message;
  }

  return null;
});

function setCustomKuid(value: string | number): void {
  emit('set-custom-kuid', value);
}
function onProfileSelected(profile: string): void {
  emit('profile-add', profile);
}
function removeProfile(profile: string): void {
  emit('profile-remove', profile);
}
</script>
