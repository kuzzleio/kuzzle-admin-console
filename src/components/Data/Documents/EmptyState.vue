<template>
  <b-card
    bg-variant="light"
    class="EmptyState text-center"
    data-cy="DocumentsEmptyState"
  >
    <i
      class="text-secondary fas fa-6x mb-3"
      :class="{
        'fa-ellipsis-h': !hasNewDocuments,
        'fa-file-alt': hasNewDocuments
      }"
    ></i>
    <h2 class="text-secondary font-weight-bold">
      <span v-if="hasNewDocuments">
        There are new documents in the collection</span
      >
      <span v-else>No documents matching your filters</span>
    </h2>
    <p
      v-if="canCreateDocument(index, collection) && !hasNewDocuments"
      class="text-secondary"
    >
      You can try changing your filters or create a new document by hitting the
      "Create New Document" button on top of the page.
    </p>
    <p v-if="hasNewDocuments" class="text-secondary">
      You can refresh the collection by hitting the "Refresh" button on top of
      the page
    </p>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    index: String,
    collection: String,
    hasNewDocuments: Boolean
  },
  computed: {
    ...mapGetters('auth', ['canCreateDocument'])
  }
}
</script>
