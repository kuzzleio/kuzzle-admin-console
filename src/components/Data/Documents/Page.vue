<template>
  <div class="DocumentsPage">
    <headline>
      {{ collection }}
      <collection-dropdown
        class="icon-medium icon-black"
        :index="index"
        :collection="collection"
      />
    </headline>

    <collection-tabs />

    <list-not-allowed v-if="!canSearchDocument(index, collection)" />

    <div class="DocumentsPage-container">
      <div v-if="isCollectionEmpty" class="card-panel">
        <realtime-only-empty-state
          v-if="isRealtimeCollection"
          :index="index"
          :collection="collection"
        />
        <empty-state v-else :index="index" :collection="collection" />
      </div>

      <div v-if="!isCollectionEmpty">
        <div class="card-panel card-header">
          <div class="DocumentsPage-filtersAndButtons row">
            <div class="col s9 xl9">
              <filters
                :available-operands="searchFilterOperands"
                :current-filter="currentFilter"
                :collection-mapping="collectionMapping"
                @filters-updated="onFiltersUpdated"
                @reset="onFiltersUpdated"
              />
            </div>
            <div class="col s3 xl3">
              <list-view-buttons
                :active-view="listViewType"
                :boxes-enabled="true"
                :map-enabled="isCollectionGeo"
                @list="onListViewClicked"
                @boxes="onBoxesViewClicked"
                @map="onMapViewClicked"
                @column="onColumnViewClicked"
                @time-series="onTimeSeriesClicked"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isCollectionEmpty" class="card-panel card-body">
        <div class="row">
          <div class="col s12">
            Result per page:
            <span v-for="(v, i) in resultPerPage" :key="i"
              ><a
                href="#"
                :class="{ active: v === paginationSize }"
                @click.prevent="changePaginationSize(v)"
                >{{ v }}</a
              >{{ i === resultPerPage.length - 1 ? '' : ' / ' }}</span
            >
          </div>
        </div>

        <no-results-empty-state v-show="!documents.length" />

        <list-actions
          v-if="documents.length && listViewType !== 'time-series'"
          :all-checked="allChecked"
          :display-bulk-delete="
            hasSelectedDocuments &&
              canDeleteDocument(index, collection) &&
              listViewType !== 'map'
          "
          :geopoint-list="mappingGeopoints"
          :view-type="listViewType"
          :display-create="canCreateDocument(index, collection)"
          :display-geopoint-select="listViewType === 'map'"
          :display-toggle-all="
            (listViewType !== 'map' && canCreateDocument(index, collection)) ||
              canDeleteDocument(index, collection)
          "
          @create="onCreateClicked"
          @bulk-delete="onBulkDeleteClicked"
          @toggle-all="onToggleAllClicked"
          @select-geopoint="onSelectGeopoint"
          @refresh="onRefreshClicked"
        />

        <div v-show="documents.length" class="row">
          <div
            v-show="listViewType === 'list'"
            class="DocumentList-list col s12"
          >
            <div class="DocumentList-materializeCollection collection">
              <div
                v-for="document in documents"
                :key="document.id"
                class="collection-item collection-transition"
              >
                <document-list-item
                  :document="document"
                  :collection="collection"
                  :index="index"
                  :is-checked="isChecked(document.id)"
                  @checkbox-click="toggleSelectDocuments"
                  @edit="onEditDocumentClicked"
                  @delete="onDeleteClicked"
                />
              </div>
            </div>

            <div v-show="documents.length" class="row">
              <div class="col s12">
                <pagination
                  :from="paginationFrom"
                  :max-page="1000"
                  :number-in-page="documents.length"
                  :size="paginationSize"
                  :total="totalDocuments"
                  @change-page="changePage"
                />
              </div>
            </div>
          </div>

          <div
            v-show="listViewType === 'column'"
            class="DocumentList-column col s12"
          >
            <div class="DocumentList-materializeCollection h-scroll">
              <Column
                :documents="documents"
                :mapping="collectionMapping"
                :index="index"
                :collection="collection"
                @edit="onEditDocumentClicked"
                @delete="onDeleteClicked"
              />
            </div>

            <div v-show="documents.length" class="row">
              <div class="col s12">
                <pagination
                  :from="paginationFrom"
                  :max-page="1000"
                  :number-in-page="documents.length"
                  :size="paginationSize"
                  :total="totalDocuments"
                  @change-page="changePage"
                />
              </div>
            </div>
          </div>

          <div v-show="listViewType === 'boxes'" class="col s12">
            <div class="DocumentList-boxes">
              <document-box-item
                v-for="document in documents"
                :key="document.id"
                :collection="collection"
                :index="index"
                :document="document"
                @edit="onEditDocumentClicked"
                @delete="onDeleteClicked"
              />
            </div>

            <div v-show="documents.length" class="row">
              <div class="col s12">
                <pagination
                  :from="paginationFrom"
                  :max-page="1000"
                  :number-in-page="documents.length"
                  :size="paginationSize"
                  :total="totalDocuments"
                  @change-page="changePage"
                />
              </div>
            </div>
          </div>

          <div
            v-show="listViewType === 'time-series'"
            class="DocumentList-timeseries col s12"
          >
            <div class="DocumentList-materializeCollection h-scroll">
              <TimeSeries
                :documents="documents"
                :mapping="collectionMapping"
                :index="index"
                :collection="collection"
                @edit="onEditDocumentClicked"
                @delete="onDeleteClicked"
              />
            </div>

            <div v-show="documents.length" class="row">
              <div class="col s12">
                <pagination
                  :from="paginationFrom"
                  :max-page="1000"
                  :number-in-page="documents.length"
                  :size="paginationSize"
                  :total="totalDocuments"
                  @change-page="changePage"
                />
              </div>
            </div>
          </div>

          <div v-if="listViewType === 'map'" class="DocumentList-map col s12">
            <view-map
              :documents="geoDocuments"
              :get-coordinates="getCoordinates"
              :selected-geopoint="selectedGeopoint"
              :index="index"
              :collection="collection"
              @edit="onEditDocumentClicked"
              @delete="onDeleteClicked"
            />
          </div>
          <div v-show="documents.length" class="row">
            <div v-if="listViewType === 'map'" class="col s12">
              <pagination
                :from="paginationFrom"
                :max-page="1000"
                :number-in-page="documents.length"
                :size="paginationSize"
                :total="totalDocuments"
                @change-page="changePage"
              />
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
    />
  </div>
</template>

<script>
import _ from 'lodash'

import DocumentListItem from './DocumentListItem'
import DocumentBoxItem from './DocumentBoxItem'
import Column from './Views/Column'
import TimeSeries from './Views/TimeSeries'
import DeleteModal from './DeleteModal'
import ListViewButtons from './ListViewButtons'
import EmptyState from './EmptyState'
import ListActions from './ListActions'
import NoResultsEmptyState from './NoResultsEmptyState'
import RealtimeOnlyEmptyState from './RealtimeOnlyEmptyState'
import CollectionTabs from '../Collections/Tabs'
import Filters from '../../Common/Filters/Filters'
import ListNotAllowed from '../../Common/ListNotAllowed'
import CollectionDropdown from '../Collections/Dropdown'
import Headline from '../../Materialize/Headline'
import Pagination from '../../Materialize/Pagination'
import ViewMap from './ViewMap'
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

const LOCALSTORAGE_PREFIX = 'current-list-view'
const LIST_VIEW_LIST = 'list'
const LIST_VIEW_BOXES = 'boxes'
const LIST_VIEW_MAP = 'map'
const LIST_VIEW_COLUMN = 'column'
const LIST_VIEW_TIME_SERIES = 'time-series'

export default {
  name: 'DocumentsPage',
  components: {
    CollectionTabs,
    CollectionDropdown,
    DeleteModal,
    DocumentBoxItem,
    DocumentListItem,
    Column,
    TimeSeries,
    EmptyState,
    Headline,
    Filters,
    ListActions,
    ListNotAllowed,
    ListViewButtons,
    NoResultsEmptyState,
    Pagination,
    RealtimeOnlyEmptyState,
    ViewMap
  },
  props: {
    index: String,
    collection: String
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
      resultPerPage: [10, 25, 50, 100, 500]
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
      return false
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
    },
    documents: {
      immediate: true,
      handler() {
        this.addHumanReadableDateFields()
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
        params: { id }
      })
    },

    // DELETE
    // =========================================================================
    performDeleteDocuments,
    async onDeleteConfirmed(documentsToDelete) {
      this.deleteModalIsLoading = true
      try {
        await this.performDeleteDocuments(
          this.index,
          this.collection,
          documentsToDelete
        )
        this.closeDeleteModal()
        this.fetchDocuments()
        this.deleteModalIsLoading = false
      } catch (e) {
        this.$store.direct.commit.toaster.setToast({ text: e.message })
        this.$log.error(e)
      }
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
    onRefreshClicked() {
      this.fetchDocuments()
    },
    // LIST (FETCH & SEARCH)
    // =========================================================================
    performSearchDocuments,
    async onFiltersUpdated(newFilters) {
      this.currentFilter = newFilters
      try {
        filterManager.save(
          this.currentFilter,
          this.$router,
          this.index,
          this.collection
        )
        await this.fetchDocuments()
      } catch (e) {
        this.$store.direct.commit.toaster.setToast({
          text: 'An error occurred while updating filters: <br />' + e.message
        })
        this.$log.error(e)
      }
    },
    async fetchDocuments() {
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
      try {
        const res = await this.performSearchDocuments(
          this.collection,
          this.index,
          searchQuery,
          pagination,
          sorting
        )
        this.documents = res.documents
        this.totalDocuments = res.total
      } catch (e) {
        this.$store.direct.commit.toaster.setToast({
          text: 'An error occurred while performing search: <br />' + e.message
        })
        this.$log.error(e)
      }
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
    onColumnViewClicked() {
      this.listViewType = LIST_VIEW_COLUMN
      this.saveListView()
    },
    onBoxesViewClicked() {
      this.listViewType = LIST_VIEW_BOXES
      this.saveListView()
    },
    onTimeSeriesClicked() {
      this.listViewType = LIST_VIEW_TIME_SERIES
      this.saveListView()
    },
    onMapViewClicked() {
      this.listViewType = LIST_VIEW_MAP
      this.saveListView()
    },
    // Collection Metadata management
    // =========================================================================
    async loadMappingInfo() {
      const { properties } = await getMappingDocument(
        this.collection,
        this.index
      )
      this.collectionMapping = properties

      this.mappingGeopoints = this.listMappingGeopoints(this.collectionMapping)
      this.selectedGeopoint = this.mappingGeopoints[0]
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
      this.$router.push({ query: mergedQuery }).catch(() => {})
    },
    addHumanReadableDateFields() {
      const dateFields = []

      const findDateFields = (mapping, previousKey) => {
        for (const [field, value] of Object.entries(mapping)) {
          if (typeof value === 'object') {
            findDateFields(value, field)
          } else if (field === 'type' && value === 'date') {
            dateFields.push(previousKey)
          }
        }
      }

      const changeField = document => {
        for (const [field, value] of Object.entries(document)) {
          if (dateFields.includes(field) && Number.isInteger(value)) {
            const date =
              `${value}`.length === 13
                ? new Date(value)
                : new Date(value * 1000)

            document[field] += ` (${date.toUTCString()})`
          } else if (value && typeof value === 'object') {
            changeField(value)
          }
        }
      }

      findDateFields(this.collectionMapping, null)

      this.documents.forEach(changeField)
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

.h-scroll {
  overflow-x: auto;
  overflow-y: hidden;
}

.DocumentColumnItem {
  padding: 3px 5px;
  white-space: pre;
  word-wrap: break-word;
  font-size: 0.9rem;
}
</style>
