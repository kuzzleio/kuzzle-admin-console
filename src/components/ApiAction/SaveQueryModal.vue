<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Choose a name for this query</DialogTitle>
      </DialogHeader>

      <form ref="form" class="flex flex-col gap-1.5" @submit.stop.prevent="handleOk">
        <Label for="name-input">Name</Label>
        <Input
          id="name-input"
          v-model="name"
          :aria-describedby="nameState === false ? 'name-feedback' : undefined"
          :aria-invalid="nameState === false ? 'true' : undefined"
          :class="nameState === false ? 'border-destructive' : ''"
          data-cy="api-actions-modal-name-input"
          required
        />
        <p v-if="nameState === false" id="name-feedback" class="m-0 text-sm text-destructive">
          {{ feedback }}
        </p>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="close"> Cancel </Button>
        <Button @click="handleOk">
          <span data-cy="api-actions-modal-ok-button">OK</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const props = withDefaults(
  defineProps<{
    isQueryNameValid?: ((name: string) => boolean) | null;
    open?: boolean;
  }>(),
  { isQueryNameValid: null, open: false },
);

const emit = defineEmits<{
  (e: 'storeNewQuery', name: string): void;
  (e: 'update:open', open: boolean): void;
}>();

const formEl = useTemplateRef<HTMLFormElement>('form');

const feedback = ref('');
const name = ref('');
const nameState = ref<boolean | null>(null);

function reset(): void {
  feedback.value = '';
  name.value = '';
  nameState.value = null;
}

watch(
  () => props.open,
  (open) => {
    if (!open) {
      reset();
    }
  },
);

function checkFormValidity(): boolean {
  const isPresent = formEl.value?.checkValidity() ?? false;
  const isValid = props.isQueryNameValid ? props.isQueryNameValid(name.value) : true;

  nameState.value = isPresent && isValid;

  if (!nameState.value) {
    feedback.value = isPresent ? 'Name already used' : 'Name is required';
  }

  return nameState.value;
}

function close(): void {
  emit('update:open', false);
}

function handleOk(): void {
  if (!checkFormValidity()) {
    return;
  }

  emit('storeNewQuery', name.value);
  close();
}
</script>
