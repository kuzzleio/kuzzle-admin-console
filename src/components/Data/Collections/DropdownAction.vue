<template>
  <span>
    <b-dropdown
      data-cy="CollectionDropdownAction"
      no-caret
      toggle-class="collectionDropdown"
      variant="light"
      :id="`collection-${collection}`"
    >
      <template v-slot:button-content>
        <i class="fas fa-ellipsis-v" />
      </template>

      <b-dropdown-group id="collection-dd-group-actions" header="Actions">
        <b-dropdown-item
          :disabled="!canEditCollection(index, collection)"
          :title="
            !canEditCollection(index, collection)
              ? 'Your rights do not allow you to edit this collection'
              : ''
          "
          :to="
            canEditCollection(index, collection)
              ? { name: 'EditCollection', params: { collection, index } }
              : ''
          "
        >
          Edit collection
        </b-dropdown-item>
        <b-dropdown-item v-if="isRealtime" @click="removeRealtimeCollection">
          Remove collection
        </b-dropdown-item>
        <b-dropdown-item @click="onDeleteCollectionClicked">
          Remove collection
        </b-dropdown-item>
        <template v-if="!isRealtime && !isList">
          <b-dropdown-item
            :to="{
              name: 'DocumentList',
              params: { collection: collection, index: index }
            }"
          >
            Browse documents
          </b-dropdown-item>
        </template>

        <b-dropdown-item
          v-if="!isRealtime && isList"
          class="text-secondary"
          data-cy="CollectionDropdown-clear"
          :disabled="!canTruncateCollection(index, collection)"
          :title="
            !canSubscribe(index, collection)
              ? 'Your rights do not allow you to truncate this collection'
              : ''
          "
          @click.prevent="openModal"
        >
          Clear documents
        </b-dropdown-item>
      </b-dropdown-group>
    </b-dropdown>

    <modal-clear
      :id="'collection-clear-' + collection"
      :index="index"
      :collection="collection"
      @clear="$emit('clear')"
    />
    <b-modal
      size="lg"
      id="deleteCollectionPrompt"
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
          data-cy="DeleteCollectionPrompt-OK"
          variant="danger"
          :disabled="!deleteConfirmation"
          @click="onDeleteCollectionConfirmed"
          >OK</b-button
        >
      </template>
    </b-modal>
  </span>
</template>

<script>
import ModalClear from './ModalClear.vue'
import { mapGetters } from 'vuex'
export default {
  name: 'CollectionDropdown',
  components: {
    ModalClear
  },
  data: function() {
    return {
      collectionToDelete: '',
      deleteConfirmation: ''
    }
  },
  props: {
    collection: String,
    index: String,
    isRealtime: Boolean
  },
  computed: {
    ...mapGetters('auth', [
      'canEditCollection',
      'canSubscribe',
      'canTruncateCollection'
    ]),
    isList() {
      return this.$route.name === 'DocumentList'
    },
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
    async onDeleteCollectionConfirmed() {
      if (!this.deleteConfirmation) {
        return
      }
      try {
        await this.$store.direct.dispatch.index.deleteCollection({
          index: this.index,
          collection: this.collectionToDelete
        })
        this.$bvModal.hide('deleteCollectionPrompt')
        this.$router.push({ path: '/data/' + this.index })
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
    },
    onDeleteCollectionClicked() {
      this.collectionToDelete = this.collection
      this.$bvModal.show('deleteCollectionPrompt')
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
    },
    removeRealtimeCollection() {
      this.$store.direct.dispatch.collection.removeRealtimeCollection({
        index: this.index,
        collection: this.collection
      })
    },
    openModal() {
      if (
        this.canTruncateCollection(this.$props.index, this.$props.collection)
      ) {
        this.$bvModal.show(`collection-clear-${this.collection}`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .collectionDropdown {
  background-color: $light-grey-color;
  border: none;
}

::v-deep .show .collectionDropdown i {
  transform: rotate(90deg);
}
</style>
