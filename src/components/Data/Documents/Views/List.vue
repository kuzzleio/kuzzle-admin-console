<template>
  <div class="DocumentsListView">
    <div class="mb-3 d-flex flex-row">
      <div class="flex-grow-1">
        <b-button
          variant="outline-dark"
          class="mr-2"
          @click="$emit('toggle-all')"
        >
          <i
            :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'} left`"
          />
          Toggle all
        </b-button>

        <b-button
          variant="outline-danger"
          class="mr-2"
          :disabled="!bulkDeleteEnabled"
          @click="$emit('bulk-delete')"
        >
          <i class="fa fa-minus-circle left" />
          Delete
        </b-button>
      </div>

      <div v-if="hasNewDocuments">
        <b-button
          class="mr-2"
          data-cy="DocumentListView-newDocsBadge"
          pill
          variant="info"
          title="The number of document in the collection has changed. Click to refresh."
          @click="$emit('refresh')"
          ><i class="fas fa-file-alt"></i
        ></b-button>
      </div>
      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
    </div>
    <b-list-group class="w-100">
      <b-list-group-item
        v-for="document in documents"
        class="p-2"
        data-cy="DocumentList-item"
        :key="document._id"
      >
        <document-list-item
          :document="document"
          :collection="collection"
          :index="index"
          :is-checked="isChecked(document._id)"
          :notification="notifications[document._id]"
          @checkbox-click="$emit('checkbox-click', $event)"
          @delete="$emit('delete', $event)"
        />
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import DocumentListItem from '../DocumentListItem'
import { mapGetters } from 'vuex'
import PerPageSelector from '@/components/Common/PerPageSelector'

export default {
  name: 'DocumentsListView',
  components: {
    DocumentListItem,
    PerPageSelector
  },
  props: {
    allChecked: {
      type: Boolean,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    currentPageSize: {
      type: Number,
      default: 25
    },
    documents: {
      type: Array,
      required: true
    },
    index: {
      type: String,
      required: true
    },
    selectedDocuments: {
      type: Array,
      required: true
    },
    totalDocuments: {
      type: Number
    },
    notifications: {
      type: Object,
      default: () => ({})
    },
    hasNewDocuments: Boolean
  },
  data() {
    return {
      itemsPerPage: [10, 25, 50, 100, 500]
    }
  },
  computed: {
    ...mapGetters('auth', ['canDeleteDocument']),
    hasSelectedDocuments() {
      return this.selectedDocuments.length > 0
    },
    bulkDeleteEnabled() {
      return (
        this.canDeleteDocument(this.index, this.collection) &&
        this.hasSelectedDocuments
      )
    }
  },
  methods: {
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    }
  }
}
</script>

<style></style>
