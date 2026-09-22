<template>
  <Dialog :dismissible="false" :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent data-cy="CollectionClearModal" labelled-by="collection-clear-title">
      <DialogHeader>
        <DialogTitle id="collection-clear-title">
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

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

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
import { useKuzzleStore } from '@/stores';

export default defineComponent({
  name: 'ClearCollectionModal',
  components: {
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
  // `dismissible: false` : vider une collection n'est pas annulable, la modale
  // ne se ferme pas sur un clic à côté.
  props: {
    collection: {
      default: '',
      type: String,
    },
    index: {
      default: '',
      type: String,
    },
    open: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      confirmation: '',
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    confirmationOk(): boolean {
      return this.collection !== null && this.collection === this.confirmation;
    },
  },
  watch: {
    open(open: boolean) {
      if (!open) {
        this.confirmation = '';
      }
    },
  },
  methods: {
    close(): void {
      this.$emit('update:open', false);
    },
    async clearCollection(): Promise<void> {
      if (
        !this.$kuzzle ||
        this.index.trim() === '' ||
        this.collection.trim() === '' ||
        !this.confirmationOk
      ) {
        return;
      }

      try {
        await this.$kuzzle.query({
          controller: 'collection',
          action: 'truncate',
          index: this.index,
          collection: this.collection,
          refresh: 'wait_for',
        });
        this.$emit('clear');
        this.close();
      } catch (err) {
        this.$log.error(err);
        this.$toast.danger(
          'Ooops! Something went wrong while clearing the collection.',
          'The complete error has been printed to the console.',
        );
      }
    },
  },
});
</script>
