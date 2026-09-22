<template>
  <Dialog :dismissible="false" :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent :data-cy="'ModalDeleteProfiles'" labelled-by="profiles-delete-title">
      <DialogHeader>
        <DialogTitle id="profiles-delete-title">Profile deletion</DialogTitle>
      </DialogHeader>

      <template v-if="!isLoading">
        <DialogDescription v-if="candidatesForDeletion.length > 1">
          Do you really want to delete {{ candidatesForDeletion.length }} profiles?
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
          data-cy="ModalDeleteProfiles-submitBtn"
          :disabled="isLoading"
          variant="destructive"
          @click="$emit('confirm', candidatesForDeletion)"
        >
          Delete Profiles
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

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

export default defineComponent({
  name: 'ProfileDeleteModal',
  components: {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Spinner,
  },
  // `dismissible: false` : une suppression ne se ferme pas sur un clic à côté.
  props: {
    candidatesForDeletion: {
      default: () => [],
      type: Array as PropType<string[]>,
    },
    isLoading: {
      default: false,
      type: Boolean,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  watch: {
    // `b-modal` émettait `hide` quelle que soit la façon de fermer. Ici la
    // fermeture est un seul état, et l'événement en découle : les sites d'appel
    // qui réinitialisent leur sélection n'ont pas à changer.
    open(open: boolean) {
      if (!open) {
        this.$emit('hide');
      }
    },
  },
  methods: {
    close(): void {
      this.$emit('update:open', false);
    },
    truncateName,
  },
});
</script>
