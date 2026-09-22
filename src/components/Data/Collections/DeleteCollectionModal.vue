<template>
  <Dialog :dismissible="false" :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl" labelled-by="delete-collection-title">
      <DialogHeader>
        <DialogTitle id="delete-collection-title">
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

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

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
import { useStorageIndexStore } from '@/stores';
import type { Collection, Index } from '@/stores/types/storage-index';
import { truncateName } from '@/utils';

export default defineComponent({
  name: 'DeleteCollectionModal',
  components: {
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormDescription,
    FormItem,
    Input,
    Label,
  },
  // `dismissible: false` : une suppression ne se ferme pas sur un clic à côté.
  props: {
    collection: {
      default: null,
      type: Object as PropType<Collection | null>,
    },
    index: {
      default: null,
      type: Object as PropType<Index | null>,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      confirmation: '',
      error: '',
    };
  },
  computed: {
    isConfirmationValid(): boolean {
      return this.collection ? this.confirmation === this.collection.name : false;
    },
  },
  watch: {
    open(open: boolean) {
      if (!open) {
        this.resetForm();
      }
    },
  },
  methods: {
    truncateName,
    resetForm(): void {
      this.confirmation = '';
      this.error = '';
    },
    close(): void {
      this.$emit('update:open', false);
    },
    onCancel(): void {
      this.close();
      this.$emit('cancel');
    },
    performDelete(): void {
      if (!this.isConfirmationValid || !this.index || !this.collection) {
        return;
      }

      try {
        this.storageIndexStore.deleteCollection({
          index: this.index,
          collection: this.collection,
        });

        this.close();
        this.$emit('delete-successful');
      } catch (err) {
        this.$log.error(err);
        this.error = (err as Error).message;
      }
    },
  },
});
</script>
