<template>
  <span>
    <b-dropdown
      data-cy="CollectionDropdownAction"
      no-caret
      toggle-class="collectionDropdown"
      variant="light"
      :id="`collection-${collectionName}`"
    >
      <template v-slot:button-content>
        <i class="fas fa-ellipsis-v" />
      </template>

      <b-dropdown-group header="Actions">
        <b-dropdown-item
          :disabled="!canEditCollection(indexName, collectionName)"
          :title="
            !canEditCollection(indexName, collectionName)
              ? 'Your rights do not allow you to edit this collection'
              : ''
          "
          :to="
            canEditCollection(indexName, collectionName)
              ? {
                  name: 'EditCollection',
                  params: {
                    collectionName: collectionName,
                    indexName: indexName
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
          :disabled="!canTruncateCollection(indexName, collectionName)"
          :title="
            !canTruncateCollection(indexName, collectionName)
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
      :id="'collection-clear-' + collectionName"
      :index="indexName"
      :collection="collectionName"
      @clear="$emit('clear')"
    />
  </span>
</template>

<script>
import ModalClear from './ModalClear.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'CollectionDropdownAction',
  components: {
    ModalClear
  },
  data: function() {
    return {
      deleteConfirmation: ''
    }
  },
  props: {
    collectionName: {
      type: String,
      required: true
    },
    indexName: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapGetters('auth', ['canEditCollection', 'canTruncateCollection'])
  },
  methods: {
    onDeleteCollectionClicked() {
      this.$emit('delete-collection-clicked')
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
    },
    openModal() {
      if (this.canTruncateCollection(this.indexName, this.collectionName)) {
        this.$bvModal.show(`collection-clear-${this.collectionName}`)
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
