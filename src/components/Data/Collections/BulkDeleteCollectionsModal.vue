<template>
  <Dialog :dismissible="false" :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="tw:max-w-2xl" labelled-by="bulk-delete-collections-title">
      <DialogHeader>
        <DialogTitle id="bulk-delete-collections-title">
          Are you sure you want to delete all the selected collections?
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="performDelete">
        <FormItem>
          <Label for="inputConfirmation">
            Type 'DELETE' to confirm the deletion of the selected collections
          </Label>
          <Input
            id="inputConfirmation"
            v-model="confirmation"
            data-cy="BulkDeleteCollectionsModal-input-confirmation"
            required
            type="text"
          />
          <FormDescription>This operation is NOT reversible</FormDescription>
        </FormItem>
        <Alert v-if="error" class="tw:mt-4" variant="destructive">{{ error }}</Alert>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="onCancel"> Cancel </Button>
        <Button
          data-cy="BulkDeleteCollectionsModal-deleteBtn"
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

const BULK_DELETE_CONFIRMATION = 'DELETE';

export default defineComponent({
  name: 'BulkDeleteCollectionsModal',
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
    collections: {
      default: () => [],
      type: Array as PropType<Collection[]>,
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
      return this.confirmation === BULK_DELETE_CONFIRMATION;
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
    async performDelete(): Promise<void> {
      if (!this.isConfirmationValid || !this.index) {
        return;
      }

      try {
        await this.storageIndexStore.bulkDeleteCollections({
          index: this.index,
          collections: this.collections,
        });

        this.close();
        this.$emit('delete-successful');
      } catch (err) {
        this.error = (err as Error).message;
      }
    },
  },
});
</script>
