<template>
  <b-modal
    class="DeleteIndexModal"
    ref="deleteIndexModal"
    size="lg"
    :id="id"
    @hide="resetForm"
  >
    <template v-slot:modal-title>
      Index <strong>{{ truncateName(index.name) }}</strong> deletion
    </template>

    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="closeModal(false)">
        Cancel
      </b-button>
      <b-button
        variant="danger"
        data-cy="DeleteIndexModal-deleteBtn"
        :disabled="index.name !== indexConfirmation"
        @click="tryDeleteIndex"
      >
        OK
      </b-button>
    </template>
    <form ref="form" v-on:submit.prevent="tryDeleteIndex">
      <b-form-group label="Index name confirmation" label-for="indexName">
        <b-form-input
          data-cy="DeleteIndexModal-name"
          id="indexName"
          v-model="indexConfirmation"
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
    id: {
      type: String,
      required: true
    },
    index: {
      required: false,
    }
  },
  data() {
    return {
      error: '',
      indexConfirmation: ''
    }
  },
  methods: {
    truncateName,
    resetForm() {
      this.indexConfirmation = ''
      this.error = ''
    },
    closeModal(isIndexDeleted) {
      this.resetForm()
      this.$bvModal.hide(this.id)
      this.$emit('modal-close', { isIndexDeleted })
    },
    async tryDeleteIndex() {
      if (this.indexConfirmation !== this.index.name) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.deleteIndex(this.index)
        this.closeModal(true)
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
