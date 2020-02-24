<template>
  <b-modal additional-class="left-align" :id="id" @hide="reset">
    <template v-slot:modal-header
      ><h5>
        Clear <span class="code">{{ collection }}</span>
      </h5>
    </template>
    <template v-slot:modal-footer="{ cancel }">
      <b-button @click="cancel()">Cancel</b-button>
      <b-button
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
        data-cy="CollectionClearModal-collectionName"
        trim
        v-model="confirmation"
        @keydown.enter="clearCollection(index, collection)"
      ></b-form-input>
    </b-form-group>
  </b-modal>
</template>

<script>
import Focus from '../../../directives/focus.directive'
import Title from '../../../directives/title.directive'

export default {
  name: 'ClearCollectionModal',
  directives: {
    Focus,
    Title
  },
  props: {
    id: String,
    index: String,
    collection: String
  },
  data() {
    return {
      confirmation: ''
    }
  },
  computed: {
    confirmationOk() {
      return this.collection !== null && this.collection === this.confirmation
    }
  },
  methods: {
    reset() {
      this.confirmation = ''
    },
    refreshSearch() {
      // WARNING THIS IS EVIL
      this.$router.go()
    },
    async clearCollection() {
      if (!this.index.trim() || !this.collection.trim()) {
        return
      }

      try {
        await this.$store.direct.dispatch.collection.clearCollection({
          index: this.index,
          collection: this.collection
        })
        this.refreshSearch()
        this.reset()
        this.$bvModal.hide(this.id)
      } catch (err) {
        this.error = err.message
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title: 'Ooops! Something went wrong while clearing the collection.',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          }
        )
      }
    }
  }
}
</script>
