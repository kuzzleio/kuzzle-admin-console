<template>
  <div class="CommonList">
    <slot name="emptySet" v-if="isCollectionEmpty"></slot>
    <crudl-document v-else
      :search-filter-operands="searchFilterOperands"
      :pagination-from="paginationFrom"
      :current-filter="currentFilter"
      :pagination-size="paginationSize"
      :index="index"
      :collection="collection"
      :documents="documents"
      :total-documents="totalDocuments"
      :display-bulk-delete="displayBulkDelete"
      :display-create="displayCreate"
      :all-checked="allChecked"
      :selected-documents="selectedDocuments"
      :length-document="selectedDocuments.length"
      :document-to-delete="documentToDelete"
      :perform-delete="performDelete"
      :collection-mapping="collectionMapping"
      @filters-updated="onFiltersUpdated"
      @create-clicked="create"
      @toggle-all="toggleAll"
      @crudl-refresh-search="fetchDocuments">

        <div class="CommonList-list collection"> <!-- .collection and .collection-* classes are MaterializeCSS helpers -->
          <div class="collection-item collection-transition" v-for="document in documents" :key="document.id">
            <component
              :is="itemName"
              @checkbox-click="toggleSelectDocuments"
              :document="document"
              :is-checked="isChecked(document.id)"
              :index="index"
              :collection="collection"
              @common-list::edit-document="editDocument"
              @delete-document="deleteDocument">
            </component>
          </div>
        </div>

    </crudl-document>
  </div>
</template>

<script>
import CrudlDocument from './CrudlDocument'
import UserItem from '../Security/Users/UserItem'
import RoleItem from '../Security/Roles/RoleItem'
import ProfileItem from '../Security/Profiles/ProfileItem'
import DocumentItem from '../Data/Documents/DocumentItem'
import * as filterManager from '../../services/filterManager'
import { SET_TOAST } from '../../vuex/modules/common/toaster/mutation-types'

export default {
  name: 'CommonList',
  components: {
    CrudlDocument,
    UserItem,
    RoleItem,
    ProfileItem,
    DocumentItem
  },
  props: {
    index: String,
    collection: String,
    itemName: String,
    displayCreate: {
      type: Boolean,
      default: false
    },
    performSearch: Function,
    performDelete: Function,
    routeCreate: String,
    routeUpdate: String,
    collectionMapping: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      searchFilterOperands: filterManager.searchFilterOperands,
      selectedDocuments: [],
      documents: [],
      totalDocuments: 0,
      documentToDelete: null,
      currentFilter: new filterManager.Filter()
    }
  },
  computed: {
    isDocumentListFiltered() {
      return this.currentFilter.active !== filterManager.NO_ACTIVE
    },
    isCollectionEmpty() {
      return !this.isDocumentListFiltered && this.totalDocuments === 0
    },
    displayBulkDelete() {
      return this.selectedDocuments.length > 0
    },
    allChecked() {
      if (!this.selectedDocuments || !this.documents) {
        return false
      }

      return this.selectedDocuments.length === this.documents.length
    },
    paginationFrom() {
      return parseInt(this.currentFilter.from) || 0
    },
    paginationSize() {
      return parseInt(this.currentFilter.size) || 10
    }
  },
  methods: {
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    },
    toggleAll() {
      if (this.allChecked) {
        this.selectedDocuments = []
        return
      }
      this.selectedDocuments = []
      this.selectedDocuments = this.documents.map(document => document.id)
    },
    toggleSelectDocuments(id) {
      let index = this.selectedDocuments.indexOf(id)

      if (index === -1) {
        this.selectedDocuments.push(id)
        return
      }

      this.selectedDocuments.splice(index, 1)
    },
    onFiltersUpdated(newFilters) {
      try {
        filterManager.save(
          newFilters,
          this.$router,
          this.index,
          this.collection
        )
      } catch (error) {
        this.$store.commit(SET_TOAST, {
          text:
            'An error occurred while updating filters: <br />' + error.message
        })
      }
    },
    fetchDocuments() {
      this.$forceUpdate()

      this.selectedDocuments = []

      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      let searchQuery = null
      searchQuery = filterManager.toSearchQuery(this.currentFilter)
      if (!searchQuery) {
        searchQuery = {}
      }

      let sorting = ['_uid'] // by default, sort on uid: prevent random order
      if (this.currentFilter.sorting) {
        sorting = filterManager.formatSort(this.currentFilter.sorting)
      }

      // TODO: refactor how search is done
      // Execute search with corresponding searchQuery
      this.performSearch(
        this.collection,
        this.index,
        searchQuery,
        pagination,
        sorting
      )
        .then(res => {
          this.documents = res.documents
          this.totalDocuments = res.total
        })
        .catch(e => {
          this.$store.commit(SET_TOAST, {
            text:
              'An error occurred while performing search: <br />' + e.message
          })
        })
    },
    editDocument(route, id) {
      this.$router.push({
        name: this.routeUpdate,
        params: { id: encodeURIComponent(id) }
      })
    },
    deleteDocument(id) {
      this.documentToDelete = id
    },
    create(route) {
      this.$router.push({ name: this.routeCreate })
    }
  },
  mounted() {
    this.currentFilter = filterManager.load(
      this.index,
      this.collection,
      this.$store.state.route
    )
    filterManager.save(
      this.currentFilter,
      this.$router,
      this.index,
      this.collection
    )
  },
  watch: {
    $route: {
      immediate: false,
      handler(newValue, oldValue) {
        this.currentFilter = filterManager.load(
          this.index,
          this.collection,
          this.$store.state.route
        )
        filterManager.save(
          this.currentFilter,
          this.$router,
          this.index,
          this.collection
        )
      }
    },
    currentFilter() {
      this.fetchDocuments()
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.CommonList-list {
  overflow: visible;
}
</style>
