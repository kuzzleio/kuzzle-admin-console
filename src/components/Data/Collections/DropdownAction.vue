<template>
  <span>
    <b-dropdown
      data-cy="CollectionDropdownAction"
      no-caret
      toggle-class="collectionDropdown"
      variant="light"
      :id="`collection-${collection.name}`"
    >
      <template v-slot:button-content>
        <i class="fas fa-ellipsis-v" />
      </template>

      <b-dropdown-group header="Actions">
        <b-dropdown-item
          :disabled="!canEditCollection(index.name, collection.name)"
          :title="
            !canEditCollection(index.name, collection.name)
              ? 'Your rights do not allow you to edit this collection'
              : ''
          "
          :to="
            canEditCollection(index.name, collection.name)
              ? {
                  name: 'EditCollection',
                  params: {
                    collectionName: collection.name,
                    indexName: index.name
                  }
                }
              : ''
          "
        >
          Edit collection
        </b-dropdown-item>
        <b-dropdown-item
          data-cy="CollectionDropdown-delete"
          v-if="
            $store.direct.getters.kuzzle.currentEnvironment
              .backendMajorVersion !== 1
          "
          @click="onDeleteCollectionClicked"
        >
          Delete collection
        </b-dropdown-item>

        <b-dropdown-item
          class="text-secondary"
          data-cy="CollectionDropdown-clear"
          :disabled="!canTruncateCollection(index.name, collection.name)"
          :title="
            !canTruncateCollection(index.name, collection.name)
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
      :index="index.name"
      :collection="collection.name"
      @clear="$emit('clear')"
    />
    <DeleteCollectionModal
      :index="index"
      :collection="collection"
      :modalId="modalDeleteId"
      @delete-successful="afterDeleteCollection"
    />
  </span>
</template>

<script>
import ModalClear from './ModalClear.vue'
import DeleteCollectionModal from './DeleteCollectionModal'

import { mapGetters } from 'vuex'

export default {
  name: 'CollectionDropdownAction',
  components: {
    ModalClear,
    DeleteCollectionModal
  },
  data: function() {
    return {
      deleteConfirmation: '',
      modalDeleteId: 'modal-collection-delete'
    }
  },
  props: {
    collection: {
      type: Object,
      required: true
    },
    index: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters('auth', ['canEditCollection', 'canTruncateCollection'])
  },
  methods: {
    onDeleteCollectionClicked() {
      this.$bvModal.show(this.modalDeleteId)
    },
    afterDeleteCollection() {
      this.$router.push({
        name: 'Collections',
        params: { indexName: this.index.name }
      })
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
    },
    openModal() {
      if (this.canTruncateCollection(this.index.name, this.collection.name)) {
        this.$bvModal.show(`collection-clear-${this.collection.name}`)
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
