<template>
  <b-modal
    class="DeleteIndexModal"
    size="lg"
    :id="modalId"
    :ref="modalId"
    @hide="resetForm"
  >
    <template v-slot:modal-title>
      <template>
        Index
        <strong>{{ truncateName(index.name) }}</strong> deletion</template
      >
    </template>

    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="onCancel()">
        Cancel
      </b-button>
      <b-button
        variant="danger"
        data-cy="DeleteIndexModal-deleteBtn"
        :disabled="!isConfirmationValid"
        @click="performDelete()"
      >
        OK
      </b-button>
    </template>
    <form ref="form" v-on:submit.prevent="performDelete()">
      <b-form-group
        label="Type the name of the index to confirm deletion"
        label-for="inputConfirmation"
        description="This operation is NOT reversible"
      >
        <b-form-input
          data-cy="DeleteIndexModal-name"
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
import { truncateName } from '@/utils'

export default {
  name: 'deleteIndexModal',
  props: {
    modalId: {
      type: String,
      required: true
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
      return this.confirmation === this.index.name
    }
  },
  methods: {
    truncateName,
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
        await this.$store.direct.dispatch.index.deleteIndex(this.index)
        this.onDeleteSuccess()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
