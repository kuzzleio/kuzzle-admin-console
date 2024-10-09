<template>
  <b-modal :id="modalId" :ref="modalId" class="BulkDeleteIndexModal" size="lg" @hide="resetForm">
    <template #modal-title> Are you sure you want to delete all the selected indexes?" </template>

    <template #modal-footer>
      <b-button variant="secondary" @click="onCancel()"> Cancel </b-button>
      <b-button
        variant="danger"
        data-cy="BulkDeleteIndexModal-deleteBtn"
        :disabled="!isConfirmationValid"
        @click="performDelete()"
      >
        OK
      </b-button>
    </template>
    <form ref="form" @submit.prevent="performDelete()">
      <b-form-group
        label="Type 'DELETE' to confirm the deletion of the selected indexes"
        label-for="inputConfirmation"
        description="This operation is NOT reversible"
      >
        <b-form-input
          id="inputConfirmation"
          v-model="confirmation"
          data-cy="BulkDeleteIndexModal-input-confirmation"
          type="text"
          required
        />
      </b-form-group>
      <b-alert :show="error.length" variant="danger">{{ error }}</b-alert>
    </form>
  </b-modal>
</template>

<script>
import { useStorageIndexStore } from '@/stores';

const BULK_DELETE_CONFIRMATION = 'DELETE';

export default {
  name: 'BulkDeleteIndexModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    indexes: {
      type: Array,
      required: false,
    },
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      error: '',
      confirmation: '',
    };
  },
  computed: {
    isConfirmationValid() {
      return this.confirmation === BULK_DELETE_CONFIRMATION;
    },
  },
  methods: {
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
        await this.storageIndexStore.bulkDeleteIndexes(this.indexes);
        this.onDeleteSuccess();
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
