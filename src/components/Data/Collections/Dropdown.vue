<template>
  <span>
    <b-dropdown
      data-cy="CollectionDropdown"
      no-caret
      toggle-class="collectionDropdown"
      variant="light"
      :id="`collection-${collection}`"
    >
      <template v-slot:button-content>
        <i class="fas fa-ellipsis-v" />
      </template>

      <b-dropdown-group id="collection-dd-group-views" header="View type">
        <b-dropdown-item
          data-cy="CollectionDropdown-list"
          :active="activeView === 'list'"
          @click="$emit('list')"
        >
          List view
        </b-dropdown-item>
        <b-dropdown-item
          data-cy="CollectionDropdown-column"
          :active="activeView === 'column'"
          @click="$emit('column')"
        >
          Column view
        </b-dropdown-item>
        <b-dropdown-item
          :disabled="!canSubscribe(index, collection)"
          :title="
            !canSubscribe(index, collection)
              ? 'Your rights do not allow you to subscribe to this collection'
              : ''
          "
          :to="
            canSubscribe(index, collection)
              ? { name: 'DataCollectionWatch', params: { collection, index } }
              : ''
          "
        >
          Realtime view
        </b-dropdown-item>
      </b-dropdown-group>
      <b-dropdown-divider />

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
              ? { name: 'DataCollectionEdit', params: { collection, index } }
              : ''
          "
        >
          Edit collection
        </b-dropdown-item>
        <b-dropdown-item v-if="isRealtime" @click="removeRealtimeCollection">
          Remove collection
        </b-dropdown-item>
        <template v-if="!isRealtime && !isList">
          <b-dropdown-item
            :to="{
              name: 'DataDocumentsList',
              params: { collection: collection, index: index }
            }"
          >
            Browse documents
          </b-dropdown-item>
        </template>

        <b-dropdown-item
          v-if="!isRealtime && isList"
          class="text-secondary"
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
    />
  </span>
</template>

<script>
import ModalClear from './ModalClear.vue'
import {
  canEditCollection,
  canSubscribe,
  canTruncateCollection
} from '../../../services/userAuthorization'

export default {
  name: 'CollectionDropdown',
  components: {
    ModalClear
  },
  props: {
    activeView: String,
    collection: String,
    index: String,
    isRealtime: Boolean,
    myclass: String
  },
  computed: {
    // WARNING THIS IS EVIL
    isList() {
      return this.$route.name === 'DocumentList'
    }
  },
  methods: {
    canEditCollection,
    canSubscribe,
    canTruncateCollection,
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
