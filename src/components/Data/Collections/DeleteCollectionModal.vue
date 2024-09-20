<template>
  <b-modal :id="modalId" :ref="modalId" class="DeleteCollectionModal" size="lg" @hide="resetForm">
    <template #modal-title>
      <template v-if="collection">
        Collection
        <strong>{{ truncateName(collection.name) }}</strong> deletion</template
      >
    </template>

    <template #modal-footer>
      <b-button variant="secondary" @click="onCancel()"> Cancel </b-button>
      <b-button
        variant="danger"
        data-cy="DeleteCollectionModal-OK"
        :disabled="!isConfirmationValid"
        @click="performDelete()"
      >
        OK
      </b-button>
    </template>
    <form ref="form" @submit.prevent="performDelete()">
      <b-form-group
        label="Type the name of the collection to confirm deletion"
        label-for="inputConfirmation"
        description="This operation is NOT reversible"
      >
        <b-form-input
          id="inputConfirmation"
          v-model="confirmation"
          data-cy="DeleteCollectionModal-confirm"
          type="text"
          required
        />
      </b-form-group>
      <b-alert :show="error.length" variant="danger">{{ error }}</b-alert>
    </form>
  </b-modal>
</template>

<script>
import { truncateName } from '@/utils';

export default {
  name: 'DeleteCollectionModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    collection: {
      type: Object,
      required: false,
    },
    index: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      error: '',
      confirmation: '',
    };
  },
  computed: {
    isConfirmationValid() {
      return this.collection ? this.confirmation === this.collection.name : false;
    },
  },
  methods: {
    truncateName,
    resetForm() {
      this.confirmation = '';
      this.error = '';
    },
    onDeleteSuccess() {
      this.resetForm();
      this.$bvModal.hide(this.modalId);
      this.$emit('delete-successful');
    },
    onCancel() {
      this.resetForm();
      this.$bvModal.hide(this.modalId);
      this.$emit('cancel');
    },

    async performDelete() {
      if (!this.isConfirmationValid) {
        return;
      }

      try {
        await this.$store.direct.dispatch.index.deleteCollection({
          index: this.index,
          collection: this.collection,
        });

        this.onDeleteSuccess();
      } catch (err) {
        this.$log.error(err);
        this.error = err.message;
      }
    },
  },
};
</script>
