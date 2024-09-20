<template>
  <div class="DocumentsListView">
    <div class="mb-3 d-flex flex-row align-items-center">
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
      <b-spinner
        v-if="isFetching"
        class="mr-3"
        variant="info"
        small
      ></b-spinner>
      <PerPageSelector
        :current-page-size="currentPageSize"
        :total-documents="totalDocuments"
        @change-page-size="$emit('change-page-size', $event)"
      />
      <new-documents-badge
        :has-new-documents="hasNewDocuments"
        @refresh="$emit('refresh')"
      />
    </div>
    <b-list-group class="w-100">
      <document-list-item
        v-for="document in documents"
        :auto-sync="autoSync"
        :collection="collection"
        :date-fields="dateFields"
        :document="document"
        :index="index"
        :is-checked="isChecked(document._id)"
        :key="document._id"
        :notification="notifications[document._id]"
        @checkbox-click="$emit('checkbox-click', $event)"
        @delete="$emit('delete', $event)"
      />
    </b-list-group>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import PerPageSelector from '@/components/Common/PerPageSelector.vue'
import DocumentListItem from '../DocumentListItem.vue'
import NewDocumentsBadge from '../Common/NewDocumentsBadge.vue'

export default {
  name: 'DocumentsListView',
  components: {
    DocumentListItem,
    PerPageSelector,
    NewDocumentsBadge
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
    dateFields: {
      type: Array,
      required: true
    },
    index: {
      type: String,
      required: true
    },
    isFetching: {
      type: Boolean
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
    hasNewDocuments: Boolean,
    autoSync: Boolean
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

<style lang="scss"></style>
