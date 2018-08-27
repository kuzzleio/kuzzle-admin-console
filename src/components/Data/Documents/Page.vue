<template>
  <div class="DocumentsPage">
    <headline>
      {{collection}}
      <collection-dropdown
        class="icon-medium icon-black"
        :index="index"
        :collection="collection"
        >
      </collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <list-not-allowed v-if="!canSearchDocument(index, collection)"></list-not-allowed>

    <div v-if="isCollectionEmpty" class="card-panel">
      <realtime-only-empty-state
        v-if="isRealtimeCollection"
        :index="index"
        :collection="collection">
      </realtime-only-empty-state>
      <empty-state
        v-else
        :index="index"
        :collection="collection">
      </empty-state>
    </div>

    <div v-if="!isCollectionEmpty">
      <div class="card-panel card-header">
        <div class="DocumentsPage-filtersAndButtons row">
          <div class="col s10">
            <filters
              :available-operands="searchFilterOperands"
              :current-filter="currentFilter"
              :collection-mapping="collectionMapping"
              @filters-updated="onFiltersUpdated"
              @reset="onFiltersUpdated"
              >
            </filters>
          </div>
          <div class="col s2">
            <list-view-buttons
              :active-view="listViewType"
              :boxes-enabled="true"
              :map-enabled="isCollectionGeo"
              @list="onListViewClicked"
              @boxes="onBoxesViewClicked"
              @map="onMapViewClicked"
              >
            </list-view-buttons>
          </div>
        </div>
      </div>

      <div class="card-panel card-body">
        <no-results-empty-state v-show="!documents.length"></no-results-empty-state>

        <list-actions
          v-if="documents.length"
          :all-checked="allChecked"
          :display-create="true"
          :display-bulk-delete="hasSelectedDocuments"
          @create="onCreateClicked"
          @bulk-delete="onBulkDeleteClicked"
          @toggle-all="onToggleAllClicked"
          >
        </list-actions>

        <div class="row" v-show="documents.length">

          <div class="col s12" v-show="listViewType === 'list'">
            <div class="collection">
              <div class="collection-item collection-transition" v-for="document in documents" :key="document.id">
                <document-list-item
                  :document="document"
                  :collection="collection"
                  :index="index"
                  :is-checked="isChecked(document.id)"
                  @checkbox-click="toggleSelectDocuments"
                  @edit="onEditDocumentClicked"
                  @delete="onDeleteClicked">
                </document-list-item>
              </div>
            </div>

            <div class="row" v-show="documents.length">
              <div class="col s12">
                <pagination
                  :from="paginationFrom"
                  :max-page="1000"
                  :number-in-page="documents.length"
                  :size="paginationSize"
                  :total="totalDocuments"
                  @change-page="changePage"
                ></pagination>
              </div>
            </div>
          </div>

          <div class="DocumentList-boxes col s12" v-show="listViewType === 'boxes'">
            <document-box-item
              v-for="document in documents"
              :collection="collection"
              :index="index"
              :document="document"
              :key="document.id"
              @edit="onEditDocumentClicked"
              @delete="onDeleteClicked"
              >
            </document-box-item>
          </div>
          <div class="DocumentList-map col s12" v-show="listViewType === 'map'">
            <i class="fa fa-map-marked fa-5x"></i>
            <h2>Map List view</h2>
            <p>This feature is not yet implemented.</p>
            <p>Hold on, we'll ship it soon!</p>
          </div>
        </div>

      </div>
    </div>

    <delete-modal
      :candidates-for-deletion="candidatesForDeletion"
      :is-loading="deleteModalIsLoading"
      :is-open="deleteModalIsOpen"
      @close="closeDeleteModal"
      @confirm="onDeleteConfirmed"
      >
    </delete-modal>
  </div>
</template>

<script>
import DocumentListItem from './DocumentListItem'
import DocumentBoxItem from './DocumentBoxItem'
import DeleteModal from './DeleteModal'
import ListViewButtons from './ListViewButtons'
import EmptyState from './EmptyState'
import ListActions from './ListActions'
import NoResultsEmptyState from './NoResultsEmptyState'
import RealtimeOnlyEmptyState from './RealtimeOnlyEmptyState'
import CollectionTabs from '../Collections/Tabs'
import CommonList from '../../Common/CommonList'
import Filters from '../../Common/Filters/Filters'
import ListNotAllowed from '../../Common/ListNotAllowed'
import CollectionDropdown from '../Collections/Dropdown'
import Headline from '../../Materialize/Headline'
import Pagination from '../../Materialize/Pagination'
import * as filterManager from '../../../services/filterManager'
import {
  canSearchIndex,
  canSearchDocument,
  canCreateDocument,
  canDeleteDocument,
  canEditDocument
} from '../../../services/userAuthorization'
import {
  performSearchDocuments,
  performDeleteDocuments,
  getMappingDocument
} from '../../../services/kuzzleWrapper'
import { SET_TOAST } from '../../../vuex/modules/common/toaster/mutation-types'

export default {
  name: 'DocumentsPage',
  props: {
    index: String,
    collection: String
  },
  components: {
    CollectionTabs,
    CollectionDropdown,
    CommonList,
    DeleteModal,
    DocumentBoxItem,
    DocumentListItem,
    EmptyState,
    Headline,
    Filters,
    ListActions,
    ListNotAllowed,
    ListViewButtons,
    NoResultsEmptyState,
    Pagination,
    RealtimeOnlyEmptyState
  },
  data() {
    return {
      listViewType: 'list',
      searchFilterOperands: filterManager.searchFilterOperands,
      selectedDocuments: [],
      documents: [],
      totalDocuments: 0,
      documentToDelete: null,
      currentFilter: new filterManager.Filter(),
      deleteModalIsOpen: false,
      deleteModalIsLoading: false,
      candidatesForDeletion: [],
      collectionMapping: {}
    }
  },
  computed: {
    isCollectionGeo() {
      // @TODO
      return true
    },
    isDocumentListFiltered() {
      return this.currentFilter.active !== filterManager.NO_ACTIVE
    },
    isCollectionEmpty() {
      return !this.isDocumentListFiltered && this.totalDocuments === 0
    },
    hasSelectedDocuments() {
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
    },
    isRealtimeCollection() {
      if (this.$store.state.index.indexesAndCollections) {
        if (!this.$store.state.index.indexesAndCollections[this.index]) {
          return false
        }
        if (
          !this.$store.state.index.indexesAndCollections[this.index].realtime
        ) {
          return false
        }
        return (
          // prettier-ignore
          this.$store.state.index.indexesAndCollections[this.index].realtime.indexOf(this.collection) !== -1
        )
      }
    }
  },
  methods: {
    // CREATE
    // =====================================================
    onCreateClicked() {
      this.$router.push({ name: 'DataCreateDocument' })
    },

    // UPDATE
    // =====================================================
    onEditDocumentClicked(id) {
      this.$router.push({
        name: 'DataUpdateDocument',
        params: { id: encodeURIComponent(id) }
      })
    },

    // DELETE
    // =====================================================
    performDeleteDocuments,
    onDeleteConfirmed(documentsToDelete) {
      this.deleteModalIsLoading = true
      this.performDeleteDocuments(
        this.index,
        this.collection,
        documentsToDelete
      )
        .then(() => {
          this.closeDeleteModal()
          this.fetchDocuments()
          this.deleteModalIsLoading = false
          return null
        })
        .catch(e => {
          this.$store.commit(SET_TOAST, { text: e.message })
        })
    },
    closeDeleteModal() {
      this.deleteModalIsOpen = false
      this.candidatesForDeletion.splice(0, this.candidatesForDeletion.length)
    },
    onBulkDeleteClicked() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(
        this.selectedDocuments
      )
      this.deleteModalIsOpen = true
    },
    onDeleteClicked(id) {
      this.candidatesForDeletion.push(id)
      this.deleteModalIsOpen = true
    },

    // LIST (FETCH & SEARCH)
    // =====================================================
    performSearchDocuments,
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
      this.performSearchDocuments(
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

    // PAGINATION
    // =====================================================
    changePage(from) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from
        })
      )
    },

    // PERMISSIONS
    // =====================================================
    canSearchIndex,
    canSearchDocument,
    canCreateDocument,
    canDeleteDocument,
    canEditDocument,

    // SELECT ITEMS
    // =====================================================
    onToggleAllClicked() {
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
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    },

    // LIST VIEW TYPES
    // =====================================================
    onListViewClicked() {
      this.listViewType = 'list'
    },
    onBoxesViewClicked() {
      this.listViewType = 'boxes'
    },
    onMapViewClicked() {
      this.listViewType = 'map'
    }
  },
  mounted() {
    getMappingDocument(this.collection, this.index).then(response => {
      this.collectionMapping = response.mapping
    })
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
  watch: {
    $route: {
      immediate: false,
      handler(newValue, oldValue) {
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
  }
}
</script>

<style lang="scss" scoped>
.DocumentsPage {
  // @TODO Temporarily reverted
  // max-width: 1080px;
  // margin: auto;
}
.DocumentsPage-filtersAndButtons {
  margin-bottom: 0;
}

.DocumentList-map {
  text-align: center;
  padding: 30px;

  i {
    color: $lavandia-color;
  }
}

.DocumentList-boxes {
  padding: 30px 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: safe;
}
</style>
