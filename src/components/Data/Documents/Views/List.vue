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
      <i
        class="fa-circle ml-2"
        data-cy="DocumentListView-newDocsBadge"
        variant="info"
        :title="
          hasNewDocuments
            ? 'The number of document in the collection has changed. Click to refresh.'
            : 'This circle will turn green when new documents are added to this collection'
        "
        :class="{
          fas: hasNewDocuments,
          far: !hasNewDocuments,
          'text-info': hasNewDocuments,
          pointer: hasNewDocuments,
          'text-secondary': !hasNewDocuments
        }"
        @click="hasNewDocuments ? $emit('refresh') : $emit('noop')"
      ></i>
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
