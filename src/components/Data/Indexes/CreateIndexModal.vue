<template>
  <b-modal
    class="CreateIndexModal"
    ref="createIndexModal"
    size="lg"
    title="Index creation"
    :id="id"
    @hide="resetForm"
    @close="hideModal"
  >
    <template v-slot:modal-footer>
      <b-button variant="secondary" @click="hideModal">
        Cancel
      </b-button>
      <b-button
        data-cy="CreateIndexModal-createBtn"
        variant="primary"
        :disabled="index.length === 0"
        @click="tryCreateIndex"
      >
        OK
      </b-button>
    </template>
    <b-form>
      <b-form-group
        label="Index name"
        label-for="indexName"
        description="The index name should contain only lowercase characters, no space and cannot
          begin with an underscore (_)"
      >
        <b-form-input
          data-cy="CreateIndexModal-name"
          id="indexName"
          autofocus
          required
          type="text"
          v-model="index"
        ></b-form-input>
      </b-form-group>
      <b-alert
        data-cy="CreateIndexModal-alert"
        style="overflow: auto"
        :show="error.length"
        variant="danger"
        >{{ error }}</b-alert
      >
    </b-form>
  </b-modal>
</template>

<style lang="scss"></style>

<script>
export default {
  name: 'CreateIndexModal',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      error: '',
      index: ''
    }
  },
  methods: {
    resetForm() {
      this.index = ''
      this.error = ''
    },
    async hideModal() {
      await this.$store.direct.dispatch.index.listIndexes()
      this.resetForm()
      this.$bvModal.hide(this.id)
    },
    async tryCreateIndex() {
      if (!this.index.trim()) {
        return
      }

      try {
        await this.$store.direct.dispatch.index.createIndex(this.index)
        await this.$store.direct.dispatch.index.listIndexes()
        this.hideModal()
      } catch (err) {
        this.error = err.message
      }
    }
  }
}
</script>
