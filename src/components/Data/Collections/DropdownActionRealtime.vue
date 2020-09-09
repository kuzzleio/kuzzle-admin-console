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
        <b-dropdown-item @click="removeRealtimeCollection">
          Remove collection
        </b-dropdown-item>
      </b-dropdown-group>
    </b-dropdown>
  </span>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CollectionDropdownActionRealtime',
  props: {
    collection: String,
    index: String
  },
  computed: {
    ...mapGetters('auth', [
      'canEditCollection',
      'canSubscribe',
      'canTruncateCollection'
    ])
  },
  methods: {
    removeRealtimeCollection() {
      this.$store.direct.dispatch.collection.removeRealtimeCollection({
        index: this.index,
        collection: this.collection
      })
    }
  }
}
</script>

<style></style>
