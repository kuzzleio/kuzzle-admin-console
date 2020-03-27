<template>
  <div class="UserList">
    <template v-if="fetchingUsers">
      <b-row class="text-center">
        <b-col>
          <b-spinner variant="primary" class="mt-5"></b-spinner>
        </b-col>
      </b-row>
    </template>
    <template v-else>
      <slot v-if="isCollectionEmpty" name="emptySet" />
      <crudl-document
        v-else
        :search-filter-operands="searchFilterOperands"
        :pagination-from="paginationFrom"
        :pagination-size="paginationSize"
        :current-filter="currentFilter"
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
        @crudl-refresh-search="fetchDocuments"
      >
        <!-- <div class="CommonList-list collection"> -->
        <!-- .collection and .collection-* classes are MaterializeCSS helpers -->
        <!-- <div
          v-for="document in documents"
          :key="document.id"
          class="collection-item collection-transition"
        > -->
        <b-list-group class="w-100">
          <b-list-group-item
            v-for="document in documents"
            class="p-2"
            data-cy="UserList-item"
            :key="document.id"
          >
            <UserItem
              :document="document"
              :is-checked="isChecked(document.id)"
              :index="index"
              :collection="collection"
              @checkbox-click="toggleSelectDocuments"
              @common-list::edit-document="editDocument"
              @delete-document="deleteDocument"
            />
          </b-list-group-item>
        </b-list-group>
        <!-- </div> -->
        <!-- </div> -->
      </crudl-document>
    </template>
  </div>
</template>

<script>
import CrudlDocument from './CrudlDocument'
import UserItem from './UserItem'
import * as filterManager from '../../../services/filterManager'

export default {
  name: 'CommonList',
  components: {
    CrudlDocument,
    UserItem
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
      currentFilter: new filterManager.Filter(),
      fetchingUsers: false
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
  watch: {
    $route: {
      immediate: false,
      handler(newValue) {
        this.currentFilter = filterManager.load(
          this.index,
          this.collection,
          newValue
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
  },
  mounted() {
    this.currentFilter = filterManager.load(
      this.index,
      this.collection,
      this.$route
    )
    filterManager.save(
      this.currentFilter,
      this.$router,
      this.index,
      this.collection
    )
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
        this.$store.direct.commit.toaster.setToast({
          text:
            'An error occurred while updating filters: <br />' + error.message
        })
      }
    },
    async fetchDocuments() {
      this.fetchingUsers = true

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

      let sorting = ['_id'] // by default, sort on _id: prevent random order
      if (this.currentFilter.sorting) {
        sorting = filterManager.toSort(this.currentFilter)
      }

      // TODO: refactor how search is done
      // Execute search with corresponding searchQuery
      try {
        const res = await this.performSearch(
          this.collection,
          this.index,
          searchQuery,
          pagination,
          sorting
        )
        this.documents = res.documents
        this.totalDocuments = res.total
      } catch (error) {
        this.$log.error(error)
        this.$log.debug(error.stack)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while fetching users.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
      this.fetchingUsers = false
    },
    editDocument(route, id) {
      this.$router.push({
        name: this.routeUpdate,
        params: { id }
      })
    },
    deleteDocument(id) {
      this.documentToDelete = id
    },
    create() {
      this.$router.push({ name: this.routeCreate })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped></style>
