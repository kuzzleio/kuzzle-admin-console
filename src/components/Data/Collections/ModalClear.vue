<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent data-cy="CollectionClearModal" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>
          Clear <span class="code">{{ collection }}</span>
        </DialogTitle>
      </DialogHeader>

      <FormItem>
        <Label for="env-to-delete-name">Confirm collection name</Label>
        <Input
          id="env-to-delete-name"
          v-model="confirmation"
          data-cy="CollectionClearModal-collectionName"
          @keydown.enter="clearCollection"
        />
        <FormDescription>This operation is not undoable.</FormDescription>
      </FormItem>

      <DialogFooter>
        <Button variant="outline" @click="close">Cancel</Button>
        <Button
          data-cy="CollectionClearModal-submit"
          :disabled="!confirmationOk"
          variant="destructive"
          @click="clearCollection"
          >Delete All Documents</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

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
import { useToast } from '@/composables/useToast';
import { logger } from '@/plugins/logger';
import { useKuzzleStore } from '@/stores';

// `@interact-outside.prevent` : vider une collection n'est pas annulable, la modale
// ne se ferme pas sur un clic à côté.
const props = withDefaults(
  defineProps<{
    collection?: string;
    index?: string;
    open?: boolean;
  }>(),
  { collection: '', index: '', open: false },
);

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'update:open', open: boolean): void;
}>();

const kuzzleStore = useKuzzleStore();
const toast = useToast();

const confirmation = ref('');

const confirmationOk = computed(
  (): boolean => props.collection !== null && props.collection === confirmation.value,
);

watch(
  () => props.open,
  (open) => {
    if (!open) {
      confirmation.value = '';
    }
  },
);

function close(): void {
  emit('update:open', false);
}

async function clearCollection(): Promise<void> {
  const kuzzle = kuzzleStore.$kuzzle;
  if (
    !kuzzle ||
    props.index.trim() === '' ||
    props.collection.trim() === '' ||
    !confirmationOk.value
  ) {
    return;
  }

  try {
    await kuzzle.query({
      controller: 'collection',
      action: 'truncate',
      index: props.index,
      collection: props.collection,
      refresh: 'wait_for',
    });
    emit('clear');
    close();
  } catch (err) {
    logger.error(err);
    toast.danger(
      'Ooops! Something went wrong while clearing the collection.',
      'The complete error has been printed to the console.',
    );
  }
}
</script>
