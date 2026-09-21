<template>
  <Dialog :dismissible="false" :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="tw:max-w-2xl" labelled-by="delete-index-title">
      <DialogHeader>
        <DialogTitle id="delete-index-title">
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
        <Alert v-if="error" class="tw:mt-4" variant="destructive">{{ error }}</Alert>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="onCancel"> Cancel </Button>
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
import type { Index } from '@/stores/types/storage-index';
import { truncateName } from '@/utils';

export default defineComponent({
  name: 'DeleteIndexModal',
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
    index: {
      default: null,
      type: Object as PropType<Index | null>,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      confirmation: '',
      error: '',
    };
  },
  computed: {
    isConfirmationValid(): boolean {
      return Boolean(this.index) && this.confirmation === this.index?.name;
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
    setError(error: string): void {
      this.error = error;
    },
    onCancel(): void {
      this.$emit('cancel');
    },
    performDelete(): void {
      if (!this.isConfirmationValid) {
        return;
      }
      this.$emit('confirm-deletion');
    },
  },
});
</script>
