<template>
  <span>
    <b-dropdown
      data-cy="CollectionDropdown"
      no-caret
      toggle-class="collectionDropdown"
      variant="light"
      :id="'collection-' + collection"
    >
      <template v-slot:button-content>
        <i class="fas fa-ellipsis-v" />
      </template>
      <b-dropdown-item
        data-cy="CollectionDropdown-list"
        :active="activeView === 'list'"
        @click="$emit('list')"
      >
        List view
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item
        data-cy="CollectionDropdown-column"
        :active="activeView === 'column'"
        @click="$emit('column')"
      >
        Column view
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item
        :class="{ disabled: !canEditCollection(index, collection) }"
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
      <b-dropdown-divider />
      <template v-if="!isRealtime && !isList">
        <b-dropdown-item
          :to="{
            name: 'DataDocumentsList',
            params: { collection: collection, index: index }
          }"
        >
          Browse documents
        </b-dropdown-item>
        <b-dropdown-divider />
      </template>
      <b-dropdown-item
        :disabled="!canSubscribe(index, collection)"
        :to="
          canSubscribe(index, collection)
            ? { name: 'DataCollectionWatch', params: { collection, index } }
            : ''
        "
      >
        Watch messages
      </b-dropdown-item>
      <b-dropdown-divider />
      <b-dropdown-item
        v-if="!isRealtime && isList"
        :class="{
          'text-danger': canTruncateCollection(index, collection),
          'text-secondary': !canTruncateCollection(index, collection)
        }"
        @click.prevent="openModal"
      >
        Clear documents
      </b-dropdown-item>
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
      return this.$route.name === 'DataDocumentsList'
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
