<template>
  <b-modal :id="id" data-cy="CollectionClearModal" additional-class="left-align" @hide="reset">
    <template #modal-header
      ><h5>
        Clear <span class="code">{{ collection }}</span>
      </h5>
    </template>
    <template #modal-footer="{ cancel }">
      <b-button @click="cancel()">Cancel</b-button>
      <b-button
        data-cy="CollectionClearModal-submit"
        variant="danger"
        :disabled="!confirmationOk"
        @click="clearCollection(index, collection)"
        >Delete All Documents</b-button
      >
    </template>

    <b-form-group
      id="fieldset-1"
      description="This operation is not undoable."
      label="Confirm collection name"
      label-for="env-to-delete-name"
    >
      <b-form-input
        id="env-to-delete-name"
        v-model="confirmation"
        data-cy="CollectionClearModal-collectionName"
        trim
        @keydown.enter="clearCollection(index, collection)"
      />
    </b-form-group>
  </b-modal>
</template>

<script>
import { mapState } from 'pinia';

import Focus from '@/directives/focus.directive';
import { useKuzzleStore } from '@/stores';

export default {
  name: 'ClearCollectionModal',
  directives: {
    Focus,
  },
  props: {
    id: String,
    index: String,
    collection: String,
  },
  data() {
    return {
      confirmation: '',
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    confirmationOk() {
      return this.collection !== null && this.collection === this.confirmation;
    },
  },
  methods: {
    reset() {
      this.confirmation = '';
    },
    async clearCollection() {
      if (this.index.trim() === '' || this.collection.trim() === '' || !this.confirmationOk) {
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
        this.reset();
        this.$bvModal.hide(this.id);
      } catch (err) {
        this.$log.error(err);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while clearing the collection.',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }
    },
  },
};
</script>
