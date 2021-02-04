<template>
  <b-modal
    class="BulkDeleteCollections"
    size="lg"
    :id="modalId"
    :ref="modalId"
    @hide="resetForm"
  >
    <template v-slot:modal-title>
      Are you sure you want to delete all the selected collections?"
    </template>

    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="onCancel()">
        Cancel
      </b-button>
      <b-button
        variant="danger"
        data-cy="BulkDeleteCollectionsModal-deleteBtn"
        :disabled="!isConfirmationValid"
        @click="performDelete()"
      >
        OK
      </b-button>
    </template>
    <form ref="form" v-on:submit.prevent="performDelete()">
      <b-form-group
        label="Type 'DELETE' to confirm the deletion of the selected collections"
        label-for="inputConfirmation"
        description="This operation is NOT reversible"
      >
        <b-form-input
          data-cy="BulkDeleteCollectionsModal-input-confirmation"
          id="inputConfirmation"
          v-model="confirmation"
          type="text"
          required
        ></b-form-input>
      </b-form-group>
      <b-alert :show="error.length" variant="danger">{{ error }}</b-alert>
    </form>
  </b-modal>
</template>

<script>
const BULK_DELETE_CONFIRMATION = 'DELETE'

export default {
  name: 'bulkDeleteCollectionsModal',
  props: {
    modalId: {
      type: String,
      required: true
    },
    collections: {
      type: Array,
      required: false
    },
    index: {
      type: Object,
      required: false
    }
  },
  data() {
    return {
      error: '',
      confirmation: ''
    }
  },
  computed: {
    isConfirmationValid() {
      return this.confirmation === BULK_DELETE_CONFIRMATION
    }
  },
  methods: {
    resetForm() {
      this.confirmation = ''
      this.error = ''
    },
    onDeleteSuccess() {
      this.resetForm()
      this.$bvModal.hide(this.modalId)
      this.$emit('delete-successful')
    },
    onCancel() {
      this.resetForm()
      this.$bvModal.hide(this.modalId)
      this.$emit('cancel')
    },

    async performDelete() {
      if (!this.isConfirmationValid) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.bulkDeleteCollections({
          index: this.index,
          collections: this.collections
        })

        this.onDeleteSuccess()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
