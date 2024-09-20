<template>
  <b-modal :id="modalId" :ref="modalId" class="BulkDeleteCollections" size="lg" @hide="resetForm">
    <template #modal-title>
      Are you sure you want to delete all the selected collections?"
    </template>

    <template #modal-footer>
      <b-button variant="secondary" @click="onCancel()"> Cancel </b-button>
      <b-button
        variant="danger"
        data-cy="BulkDeleteCollectionsModal-deleteBtn"
        :disabled="!isConfirmationValid"
        @click="performDelete()"
      >
        OK
      </b-button>
    </template>
    <form ref="form" @submit.prevent="performDelete()">
      <b-form-group
        label="Type 'DELETE' to confirm the deletion of the selected collections"
        label-for="inputConfirmation"
        description="This operation is NOT reversible"
      >
        <b-form-input
          id="inputConfirmation"
          v-model="confirmation"
          data-cy="BulkDeleteCollectionsModal-input-confirmation"
          type="text"
          required
        />
      </b-form-group>
      <b-alert :show="error.length" variant="danger">{{ error }}</b-alert>
    </form>
  </b-modal>
</template>

<script>
const BULK_DELETE_CONFIRMATION = 'DELETE';

export default {
  name: 'BulkDeleteCollectionsModal',
  props: {
    modalId: {
      type: String,
      required: true,
    },
    collections: {
      type: Array,
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
        await this.$store.direct.dispatch.index.bulkDeleteCollections({
          index: this.index,
          collections: this.collections,
        });

        this.onDeleteSuccess();
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>
