
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

    <div class="DocumentsPage-container">

        <div v-if="isCollectionEmpty" class="card-panel">
          <realtime-only-empty-state
            v-if="isRealtimeCollection"
            :index="index"
            :collection="collection"
          >
          </realtime-only-empty-state>
          <empty-state
            v-else
            :index="index"
            :collection="collection"
          >
          </empty-state>
        </div>

        <div v-if="!isCollectionEmpty">

          <div class="card-panel card-header">
            <div class="DocumentsPage-filtersAndButtons row">
              <div class="col s10 xl10">
                <filters
                  :available-operands="searchFilterOperands"
                  :current-filter="currentFilter"
                  :collection-mapping="collectionMapping"
                  @filters-updated="onFiltersUpdated"
                  @reset="onFiltersUpdated"
                >
                </filters>
              </div>
              <div class="col s2 xl2">
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
            <div class="row">
              <div class="col s12">
                Result per page: <span v-for="(v, i) in resultPerPage" :key="i"><a href="#" @click.prevent="changePaginationSize(v)" :class="{active: v === paginationSize}">{{v}}</a>{{i === resultPerPage.length - 1 ? '' : ' / '}}</span>
              </div>
            </div>

            <no-results-empty-state v-show="!documents.length"></no-results-empty-state>

            <list-actions
              v-if="documents.length"
              :all-checked="allChecked"
              :display-bulk-delete="hasSelectedDocuments"
              :geopointList="mappingGeopoints"
              :viewType="listViewType"
              :displayCreate="canCreateDocument(this.index, this.collection)"
              :displayGeopointSelect="listViewType === 'map'"
              :displayBulkDelete="listViewType !== 'map'"
              :displayToggleAll="listViewType !== 'map'"
              @create="onCreateClicked"
              @bulk-delete="onBulkDeleteClicked"
              @toggle-all="onToggleAllClicked"
              @select-geopoint="onSelectGeopoint"
            >
            </list-actions>

            <div class="row" v-show="documents.length">

              <div class="DocumentList-list col s12" v-show="listViewType === 'list'">
                <div class="DocumentList-materializeCollection collection">
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

              <div class="col s12" v-show="listViewType === 'boxes'">
                <div class="DocumentList-boxes">
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

              <div class="DocumentList-map col s12" v-if="listViewType === 'map'">
                <view-map
                  :documents="geoDocuments"
                  :getCoordinates="this.getCoordinates"
                  :selectedGeopoint="selectedGeopoint"
                  :index="index"
                  :collection="collection"
                  @edit="onEditDocumentClicked"
                  @delete="onDeleteClicked"
                />
              </div>
              <div class="row" v-show="documents.length">
                <div class="col s12" v-if="listViewType === 'map'">
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
import _ from 'lodash'

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
import ViewMap from './ViewMap'
import MSelect from '../../Common/MSelect'
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

const LOCALSTORAGE_PREFIX = 'current-list-view'
const LIST_VIEW_LIST = 'list'
const LIST_VIEW_BOXES = 'boxes'
const LIST_VIEW_MAP = 'map'

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
    RealtimeOnlyEmptyState,
    ViewMap,
    MSelect
  },
  data() {
    return {
      searchFilterOperands: filterManager.searchFilterOperands,
      selectedDocuments: [],
      documents: [],
      totalDocuments: 0,
      documentToDelete: null,
      currentFilter: new filterManager.Filter(),
      listViewType: LIST_VIEW_LIST,
      deleteModalIsOpen: false,
      deleteModalIsLoading: false,
      candidatesForDeletion: [],
      collectionMapping: {},
      mappingGeopoints: [],
      selectedGeopoint: null,
      resultPerPage: [10, 25, 50, 100]
    }
  },
  computed: {
    geoDocuments() {
      return this.documents.filter(document => {
        const [lat, lng] = this.getCoordinates(document)
        const latFloat = parseFloat(lat)
        const lngFloat = parseFloat(lng)

        return !isNaN(latFloat) && !isNaN(lngFloat)
      })
    },
    latFieldPath() {
      return `content.${this.selectedGeopoint}.lat`
    },
    lngFieldPath() {
      return `content.${this.selectedGeopoint}.lon`
    },
    isCollectionGeo() {
      return this.mappingGeopoints.length > 0
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
    // VIEW MAP - GEOPOINTS
    // =========================================================================
    getCoordinates(document) {
      return [
        this.getProperty(document, this.latFieldPath),
        this.getProperty(document, this.lngFieldPath)
      ]
    },
    getProperty(object, path) {
      if (!object) {
        return object
      }

      const names = path.split('.')

      if (names.length === 1) {
        return object[names[0]]
      }

      return this.getProperty(object[names[0]], names.slice(1).join('.'))
    },
    onSelectGeopoint(selectedGeopoint) {
      this.selectedGeopoint = selectedGeopoint
    },
    listMappingGeopoints(mapping, path = []) {
      let attributes = []

      for (const [attributeName, { type, properties }] of Object.entries(
        mapping
      )) {
        if (properties) {
          if (properties.lat && properties.lon) {
            attributes = attributes.concat(path.concat(attributeName).join('.'))
          }

          attributes = attributes.concat(
            this.listMappingGeopoints(properties, path.concat(attributeName))
          )
        } else if (type === 'geo_point') {
          attributes = attributes.concat(path.concat(attributeName).join('.'))
        }
      }

      return attributes
    },

    // CREATE
    // =========================================================================
    onCreateClicked() {
      this.$router.push({ name: 'DataCreateDocument' })
    },

    // UPDATE
    // =========================================================================
    onEditDocumentClicked(id) {
      this.$router.push({
        name: 'DataUpdateDocument',
        params: { id: encodeURIComponent(id) }
      })
    },

    // DELETE
    // =========================================================================
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
    // =========================================================================
    performSearchDocuments,
    onFiltersUpdated(newFilters) {
      this.currentFilter = newFilters
      try {
        filterManager.save(
          this.currentFilter,
          this.$router,
          this.index,
          this.collection
        )
        this.fetchDocuments()
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

      const sorting = filterManager.toSort(this.currentFilter)

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
    // =========================================================================
    changePage(from) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from
        })
      )
    },
    changePaginationSize(size) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          size
        })
      )
    },

    // PERMISSIONS
    // =========================================================================
    canSearchIndex,
    canSearchDocument,
    canCreateDocument,
    canDeleteDocument,
    canEditDocument,

    // SELECT ITEMS
    // =========================================================================
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
    // =========================================================================
    onListViewClicked() {
      this.listViewType = LIST_VIEW_LIST
      this.saveListView()
    },
    onBoxesViewClicked() {
      this.listViewType = LIST_VIEW_BOXES
      this.saveListView()
    },
    onMapViewClicked() {
      this.listViewType = LIST_VIEW_MAP
      this.saveListView()
    },
    // Collection Metadata management
    // =========================================================================
    loadMappingInfo() {
      getMappingDocument(this.collection, this.index).then(response => {
        this.collectionMapping = response.mapping

        this.mappingGeopoints = this.listMappingGeopoints(
          this.collectionMapping
        )
        this.selectedGeopoint = this.mappingGeopoints[0]
      })
    },
    loadListView() {
      if (this.$route.query.listViewType) {
        this.listViewType = this.$route.query.listViewType
      } else {
        const typeFromLS = localStorage.getItem(
          `${LOCALSTORAGE_PREFIX}:${this.index}/${this.collection}`
        )
        if (typeFromLS) {
          this.listViewType = typeFromLS
        } else {
          this.listViewType = LIST_VIEW_LIST
        }
      }
    },
    saveListView() {
      localStorage.setItem(
        `${LOCALSTORAGE_PREFIX}:${this.index}/${this.collection}`,
        this.listViewType
      )
      const otherQueryParams = _.omit(
        this.$router.currentRoute.query,
        'listViewType'
      )
      const mergedQuery = _.merge(
        { listViewType: this.listViewType },
        otherQueryParams
      )
      this.$router.push({ query: mergedQuery })
    }
  },
  watch: {
    collection: {
      immediate: true,
      handler() {
        this.loadMappingInfo()
        this.loadListView()
        this.saveListView()

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
        this.fetchDocuments()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.DocumentsPage {
  // @TODO Temporarily reverted
  // max-width: 1080px;
  // margin: auto;
  .ViewMap {
    height: 500px;
  }
}
.DocumentsPage-container {
  max-width: $container-width;
}

.DocumentsPage-filtersAndButtons {
  margin-bottom: 0;
}

.DocumentList-list {
  .DocumentList-materializeCollection {
    overflow: visible;
  }
}

.DocumentList-boxes {
  padding: 30px 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: safe;
}

.active {
  color: $blue-color;
}
</style>
