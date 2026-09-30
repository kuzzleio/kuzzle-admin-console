<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>
          Index <strong>{{ truncateName(index ? index.name : '') }}</strong> deletion
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="performDelete">
        <FormItem>
          <Label for="inputConfirmation">Type the name of the index to confirm deletion</Label>
          <Input
            id="inputConfirmation"
            v-model="confirmation"
            data-cy="DeleteIndexModal-name"
            required
            type="text"
          />
          <FormDescription>This operation is NOT reversible</FormDescription>
        </FormItem>
        <Alert v-if="error" class="mt-4" variant="destructive">{{ error }}</Alert>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="handleCancel"> Cancel </Button>
        <Button
          data-cy="DeleteIndexModal-deleteBtn"
          :disabled="!isConfirmationValid"
          variant="destructive"
          @click="performDelete"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Index } from '@/stores/types/storage-index';
import { truncateName } from '@/utils';

// `@interact-outside.prevent` : une suppression ne se ferme pas sur un clic à côté.
const props = withDefaults(
  defineProps<{
    index?: Index | null;
    open?: boolean;
  }>(),
  { index: null, open: false },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'confirm-deletion'): void;
  (e: 'update:open', open: boolean): void;
}>();

const confirmation = ref('');
const error = ref('');

const isConfirmationValid = computed(
  (): boolean => Boolean(props.index) && confirmation.value === props.index?.name,
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      resetForm();
    }
  },
);

function resetForm(): void {
  confirmation.value = '';
  error.value = '';
}

function setError(message: string): void {
  error.value = message;
}

function handleCancel(): void {
  emit('cancel');
}

function performDelete(): void {
  if (!isConfirmationValid.value) {
    return;
  }
  emit('confirm-deletion');
}

// Appelée par `Indexes/Page` et `Collections/CollectionList` quand la
// suppression échoue.
defineExpose({ setError });
</script>
