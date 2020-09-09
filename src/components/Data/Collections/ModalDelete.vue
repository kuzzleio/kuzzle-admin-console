<template>
  <b-modal
    size="lg"
    :id="modalId"
    title="Are you sure you want to delete this collection?"
    @hidden="resetDeletePrompt"
  >
    <b-form-group
      description="This operation is NOT reversible"
      label-for="deleteCollectionPromptField"
      :state="deletionConfirmed"
      :invalid-feedback="deletionPromptFeedback"
    >
      <template v-slot:label>
        Please type the name of the collection (<span class="code">{{
          collectionToDelete
        }}</span
        >) below to confirm the deletion:
      </template>
      <b-form-input
        id="deleteCollectionPromptField"
        data-cy="DeleteCollectionPrompt-confirm"
        v-model="deleteConfirmation"
        @keypress.enter="onDeleteCollectionConfirmed"
      ></b-form-input>
    </b-form-group>
    <template v-slot:modal-footer>
      <b-button @click="$bvModal.hide('deleteCollectionPrompt')"
        >Cancel</b-button
      >
      <b-button
        v-if="
          $store.direct.getters.kuzzle.currentEnvironment
            .backendMajorVersion !== 1
        "
        data-cy="DeleteCollectionPrompt-OK"
        variant="danger"
        :disabled="!deleteConfirmation"
        @click="onDeleteCollectionConfirmed"
        >OK</b-button
      >
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'ClearCollectionModal',
  props: {
    collectionToDelete: {
      type: String
    },
    index: {
      type: String,
      required: true
    },
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return { deleteConfirmation: '' }
  },
  computed: {
    deletionConfirmed() {
      return (
        this.deleteConfirmation !== '' &&
        this.deleteConfirmation !== null &&
        this.deleteConfirmation === this.collectionToDelete
      )
    },
    deletionPromptFeedback() {
      if (this.deleteConfirmation === '' || this.deletionConfirmed) {
        return ''
      }
      return 'Confirmation is not matching collection name'
    }
  },
  methods: {
    resetDeletePrompt() {
      this.deleteConfirmation = ''
    },
    async onDeleteCollectionConfirmed() {
      if (!this.deletionConfirmed) {
        return
      }
      try {
        await this.$store.direct.dispatch.index.deleteCollection({
          index: this.index,
          collection: this.collectionToDelete
        })
        this.$emit('afterDelete')
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title: 'Ooops! Something went wrong while deleting the collection.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    }
  }
}
</script>

<style></style>
