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

      <b-dropdown-group header="Actions">
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
          :disabled="!canTruncateCollection(index, collection)"
          :title="
            !canTruncateCollection(index, collection)
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
    <modal-delete
      :collection-to-delete="collection"
      :index="index"
      :modal-id="modalDeleteId"
      @afterDelete="afterDeleteCollection"
    ></modal-delete>
  </span>
</template>

<script>
import ModalClear from './ModalClear.vue'
import ModalDelete from './ModalDelete'

import { mapGetters } from 'vuex'

export default {
  name: 'CollectionDropdownAction',
  components: {
    ModalClear,
    ModalDelete
  },
  data: function() {
    return {
      deleteConfirmation: '',
      modalDeleteId: 'modal-collection-delete'
    }
  },
  props: {
    collection: String,
    index: String
  },
  computed: {
    ...mapGetters('auth', ['canEditCollection', 'canTruncateCollection'])
  },
  methods: {
    onDeleteCollectionClicked() {
      this.$bvModal.show(this.modalDeleteId)
    },
    afterDeleteCollection() {
      this.$router.push({ name: 'Collections', params: { index: this.index } })
    },
    resetDeletePrompt() {
      this.collectionToDelete = ''
      this.deleteConfirmation = ''
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
