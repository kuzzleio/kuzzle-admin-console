<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent :data-cy="'ModalDeleteUsers'" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>User deletion</DialogTitle>
      </DialogHeader>

      <template v-if="!isLoading">
        <DialogDescription v-if="candidatesForDeletion.length > 1">
          Do you really want to delete {{ candidatesForDeletion.length }} users?
        </DialogDescription>
        <DialogDescription v-else-if="candidatesForDeletion.length === 1">
          Do you really want to delete
          <span class="code" :title="candidatesForDeletion[0]">{{
            truncateName(candidatesForDeletion[0])
          }}</span
          >?
        </DialogDescription>
      </template>
      <div v-else class="flex justify-center py-2">
        <Spinner label="Deleting" />
      </div>

      <DialogFooter>
        <Button variant="outline" @click.prevent="close"> Cancel </Button>
        <Button
          data-cy="ModalDeleteUsers-submitBtn"
          :disabled="isLoading"
          variant="destructive"
          @click="emit('confirm', candidatesForDeletion)"
        >
          Delete Users
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { watch } from 'vue';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { truncateName } from '@/utils';

// `@interact-outside.prevent` : une suppression ne se ferme pas sur un clic à côté.
const props = withDefaults(
  defineProps<{
    candidatesForDeletion?: string[];
    isLoading?: boolean;
    open?: boolean;
  }>(),
  { candidatesForDeletion: () => [], isLoading: false, open: false },
);

const emit = defineEmits<{
  (e: 'confirm', candidates: string[]): void;
  (e: 'hide'): void;
  (e: 'update:open', open: boolean): void;
}>();

// `b-modal` émettait `hide` quelle que soit la façon de fermer. Ici la
// fermeture est un seul état, et l'événement en découle : les sites d'appel
// qui réinitialisent leur sélection n'ont pas à changer.
watch(
  () => props.open,
  (open) => {
    if (!open) {
      emit('hide');
    }
  },
);

function close(): void {
  emit('update:open', false);
}
</script>
