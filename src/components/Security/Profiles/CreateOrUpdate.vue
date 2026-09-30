<template>
  <Card class="ProfileCreateOrUpdate shadow-signature">
    <CardContent class="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
      <!-- Json view -->
      <div class="flex flex-col gap-4 lg:w-7/12">
        <FormItem v-if="!id" data-cy="ProfileCreateOrUpdate-id">
          <Label for="profile-id">Profile ID</Label>
          <Input
            id="profile-id"
            :aria-invalid="idFeedback ? 'true' : undefined"
            :model-value="v$.idValue.$model ?? undefined"
            @update:model-value="v$.idValue.$model = String($event)"
          />
          <FormMessage v-if="idFeedback">{{ idFeedback }}</FormMessage>
          <FormDescription v-else>This field is mandatory</FormDescription>
        </FormItem>
        <FormItem v-else>
          <Label for="profile-id">Profile ID</Label>
          <Input id="profile-id" disabled :model-value="id" />
        </FormItem>

        <!--
          La validation refusait déjà un JSON invalide, mais rien ne le disait :
          le bouton semblait ne rien faire (#1027, porté de #1092).
        -->
        <FormMessage
          v-if="v$.profileValue.$errors.length > 0"
          data-cy="ProfileCreateOrUpdate-jsonEditor--dangerIcon"
        >
          Invalid JSON. Fix the syntax before submitting.
        </FormMessage>
        <JsonEditor
          class="ProfileCreateOrUpdate-jsonEditor"
          :content="profile"
          data-cy="ProfileCreateOrUpdate-jsonEditor"
          @change="onContentChange"
        />
      </div>

      <!-- Mapping -->
      <div class="flex flex-col lg:w-5/12">
        <h3 class="text-title font-bold text-foreground">Cheatsheet</h3>
        <div class="ProfileCreateOrUpdate-cheatsheet">
          Your profile is a set of <code>policies</code>, each of which will contain a set of roles,
          like the example below:
          <pre class="my-3 ms-3">
{
  "policies": [{
      "roleId": "roleId"
    }]
}
          </pre>
          You can also restrict your policy to a set of indexes and collections, so that your roles
          will be valid to a specific subset of your data, like the example below:
          <pre class="my-3 ms-3">
{
  "policies": [{
      "roleId": "roleId"
      "restrictedTo": {
        "index": "myindex",
        "collections": [
          "collection1",
          "collection2"...
        ]
      }
    }]
}
          </pre>
        </div>
      </div>
    </CardContent>

    <CardFooter class="justify-end gap-2">
      <Button variant="outline" @click="emit('cancel')">Cancel</Button>
      <Button
        v-if="!id"
        data-cy="ProfileCreateOrUpdate-createBtn"
        :disabled="submitting"
        @click="submit"
      >
        <i class="fa fa-plus-circle" aria-hidden="true" />
        Create
      </Button>
      <Button
        v-if="!!id"
        data-cy="ProfileCreateOrUpdate-updateBtn"
        :disabled="submitting"
        @click="submit"
      >
        <i class="fa fa-pencil-alt" aria-hidden="true" />
        Update
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { helpers, not, requiredUnless } from '@vuelidate/validators';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FormDescription, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isWhitespace, startsWithSpace } from '@/validators';
import type { ProfileSubmission } from './types';

import JsonEditor from '@/components/Common/JsonEditor.vue';

const props = withDefaults(
  defineProps<{
    id?: string;
    profile?: string;
  }>(),
  { id: undefined, profile: '{}' },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'submit', submission: ProfileSubmission): void;
}>();

const form = reactive<{ idValue: string | null; profileValue: string }>({
  idValue: null,
  profileValue: props.profile || '{}',
});
const submitting = ref(false);

const rules = computed(() => ({
  idValue: {
    isNotWhitespace: helpers.withMessage(
      'This field cannot contain just whitespaces',
      not(isWhitespace),
    ),
    required: helpers.withMessage(
      'This field cannot be empty',
      requiredUnless(() => !!props.id),
    ),
    startsWithLetter: helpers.withMessage(
      'This field cannot start with a whitespace',
      not(startsWithSpace),
    ),
  },
  profileValue: {
    syntaxOK: (value: string) => {
      try {
        JSON.parse(value);
      } catch {
        return false;
      }
      return true;
    },
  },
}));
const v$ = useVuelidate(rules, form);

const idFeedback = computed(() => {
  if (v$.value.idValue.$errors.length > 0) {
    return v$.value.idValue.$errors[0].$message;
  }

  return null;
});

function onContentChange(value: string): void {
  form.profileValue = value;
}

function submit(): void {
  v$.value.$touch();
  if (v$.value.$errors.length > 0) {
    return;
  }
  emit('submit', {
    profile: JSON.parse(form.profileValue),
    id: form.idValue,
  });
}
</script>

<style lang="scss" scoped>
.ProfileCreateOrUpdate {
  flex-grow: 1;

  &-jsonEditor {
    flex-grow: 1;
  }
  &-cheatsheet {
    flex: 1 1 1px;
    margin-bottom: 0;
    overflow: auto;
  }
}
</style>
