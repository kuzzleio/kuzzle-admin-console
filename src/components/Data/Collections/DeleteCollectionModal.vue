<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>
          <template v-if="collection">
            Collection <strong>{{ truncateName(collection.name) }}</strong> deletion
          </template>
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="performDelete">
        <FormItem>
          <Label for="inputConfirmation">
            Type the name of the collection to confirm deletion
          </Label>
          <Input
            id="inputConfirmation"
            v-model="confirmation"
            data-cy="DeleteCollectionModal-confirm"
            required
            type="text"
          />
          <FormDescription>This operation is NOT reversible</FormDescription>
        </FormItem>
        <Alert v-if="error" class="mt-4" variant="destructive">{{ error }}</Alert>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="onCancel"> Cancel </Button>
        <Button
          data-cy="DeleteCollectionModal-OK"
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
import { caught } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { useStorageIndexStore } from '@/stores';
import type { Collection, Index } from '@/stores/types/storage-index';
import { truncateName } from '@/utils';

// `@interact-outside.prevent` : une suppression ne se ferme pas sur un clic à côté.
const props = withDefaults(
  defineProps<{
    collection?: Collection | null;
    index?: Index | null;
    open?: boolean;
  }>(),
  { collection: null, index: null, open: false },
);

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'delete-successful'): void;
  (e: 'update:open', open: boolean): void;
}>();

const storageIndexStore = useStorageIndexStore();

const confirmation = ref('');
const error = ref('');

const isConfirmationValid = computed((): boolean =>
  props.collection ? confirmation.value === props.collection.name : false,
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

function close(): void {
  emit('update:open', false);
}

function onCancel(): void {
  close();
  emit('cancel');
}

async function performDelete(): Promise<void> {
  if (!isConfirmationValid.value || !props.index || !props.collection) {
    return;
  }

  try {
    await storageIndexStore.deleteCollection({
      index: props.index,
      collection: props.collection,
    });

    close();
    emit('delete-successful');
  } catch (err) {
    logger.error(err);
    error.value = caught(err).message;
  }
}
</script>
