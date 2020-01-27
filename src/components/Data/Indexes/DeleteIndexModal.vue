<template>
  <div>
    <b-modal ref="deleteIndexModal" :id="id" @hide="resetForm">
      <template v-slot:modal-title>
        Index <strong>{{ index }}</strong> deletion
      </template>

      <template v-slot:modal-footer>
        <b-button variant="secondary" @click="hideModal">
          Cancel
        </b-button>
        <b-button
          variant="primary"
          :disabled="index !== indexConfirmation"
          @click="tryDeleteIndex"
        >
          OK
        </b-button>
      </template>
      <b-form>
        <b-form-group label="Index name confirmation" label-for="indexName">
          <b-form-input
            id="indexName"
            v-model="indexConfirmation"
            type="text"
            required
          ></b-form-input>
        </b-form-group>
        <b-alert :show="error.length" variant="danger">{{ error }}</b-alert>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
export default {
  name: 'deleteIndexModal',
  props: {
    id: {
      type: String,
      required: true
    },
    index: {
      required: true,
      validator: prop => typeof prop === 'string' || prop === null
    }
  },
  data() {
    return {
      error: '',
      indexConfirmation: '',
      errorTruncated: true
    }
  },
  methods: {
    resetForm() {
      this.indexConfirmation = ''
      this.error = ''
    },
    hideModal() {
      this.resetForm()
      this.$bvModal.hide(this.id)
    },
    async tryDeleteIndex() {
      if (!this.index.trim()) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.deleteIndex(this.index)
        this.hideModal()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
