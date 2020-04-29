<template>
  <div class="DocumentList">
    <b-container
      class="DocumentList--container"
      :class="{ 'DocumentList--containerFluid': listViewType !== 'list' }"
    >
      <b-row>
        <b-col sm="8">
          <headline>
            <span class="code" :title="collection">{{
              truncateName(collection, 20)
            }}</span>
          </headline>
        </b-col>
        <b-col class="text-right mt-3">
          <b-button
            variant="primary"
            :disabled="
              indexOrCollectionNotFound || !canCreateDocument(index, collection)
            "
            :to="{ name: 'CreateDocument', params: { index, collection } }"
            >Create New Document</b-button
          ><collection-dropdown
            class="icon-medium icon-black ml-2"
            :active-view="listViewType"
            :index="index"
            :collection="collection"
            @list="onListViewClicked"
            @column="onColumnViewClicked"
            @clear="onCollectionClear"
          />
        </b-col>
      </b-row>

      <list-not-allowed v-if="!canSearchDocument(index, collection)" />
      <template v-else>
        <data-not-found
          v-if="indexOrCollectionNotFound"
          class="mt-3"
        ></data-not-found>
        <template v-else>
          <b-row class="justify-content-md-center" no-gutters>
            <b-col cols="12">
              <template v-if="isCollectionEmpty">
                <realtime-only-empty-state
                  v-if="isRealtimeCollection"
                  :index="index"
                  :collection="collection"
                />
                <empty-state v-else :index="index" :collection="collection" />
              </template>

              <template v-if="!isCollectionEmpty">
                <filters
                  class="mb-3"
                  :available-operands="searchFilterOperands"
                  :current-filter="currentFilter"
                  :collection-mapping="collectionMapping"
                  @filters-updated="onFiltersUpdated"
                  @reset="onFiltersUpdated"
                />
              </template>
            </b-col>
          </b-row>
          <template v-if="fetchingDocuments">
            <b-row class="text-center">
              <b-col>
                <b-spinner
                  v-if="fetchingDocuments"
                  variant="primary"
                  class="mt-5"
                ></b-spinner>
              </b-col>
            </b-row>
          </template>
          <template v-else>
            <template v-if="!isCollectionEmpty">
              <b-card
                class="light-shadow"
                :bg-variant="documents.length === 0 ? 'light' : 'default'"
              >
                <b-card-text class="p-0">
                  <no-results-empty-state v-if="!documents.length" />
                  <template v-else>
                    <List
                      v-if="listViewType === 'list'"
                      :all-checked="allChecked"
                      :collection="collection"
                      :documents="documents"
                      :index="index"
                      :current-page-size="paginationSize"
                      :selected-documents="selectedDocuments"
                      :total-documents="totalDocuments"
                      @bulk-delete="onBulkDeleteClicked"
                      @change-page-size="changePaginationSize"
                      @checkbox-click="toggleSelectDocuments"
                      @delete="onDeleteClicked"
                      @edit="onEditDocumentClicked"
                      @refresh="onRefresh"
                      @toggle-all="onToggleAllClicked"
                    ></List>

                    <Column
                      v-if="listViewType === 'column'"
                      :index="index"
                      :collection="collection"
                      :documents="documents"
                      :mapping="collectionMapping"
                      :selected-documents="selectedDocuments"
                      :all-checked="allChecked"
                      :current-page-size="paginationSize"
                      :total-documents="totalDocuments"
                      @edit="onEditDocumentClicked"
                      @delete="onDeleteClicked"
                      @bulk-delete="onBulkDeleteClicked"
                      @change-page-size="changePaginationSize"
                      @checkbox-click="toggleSelectDocuments"
                      @refresh="onRefresh"
                      @toggle-all="onToggleAllClicked"
                    />

                    <b-row
                      v-show="totalDocuments > paginationSize"
                      align-h="center"
                    >
                      <b-pagination
                        v-model="currentPage"
                        aria-controls="my-table"
                        class="m-2 mt-4"
                        data-cy="DocumentList-pagination"
                        :total-rows="totalDocuments"
                        :per-page="paginationSize"
                      ></b-pagination>
                    </b-row>
                    <div class="text-center mt-2" v-if="totalDocuments > 10000">
                      <small class="text-secondary"
                        >Due to limitations imposed by Elasticsearch, you won't
                        be able to browse documents beyond 10000.</small
                      >
                    </div>
                  </template>
                </b-card-text>
              </b-card>
            </template>
          </template>
        </template>
      </template>

      <delete-modal
        id="modal-delete"
        :candidates-for-deletion="candidatesForDeletion"
        :is-loading="deleteModalIsLoading"
        @confirm="onDeleteConfirmed"
        @hide="resetCandidatesForDeletion"
      />
    </b-container>
  </div>
</template>

<script>
import _ from 'lodash'

import Column from './Views/Column'
import List from './Views/List'
import DeleteModal from './DeleteModal'
import EmptyState from './EmptyState'
import NoResultsEmptyState from './NoResultsEmptyState'
import RealtimeOnlyEmptyState from './RealtimeOnlyEmptyState'
import Filters from '../../Common/Filters/Filters'
import ListNotAllowed from '../../Common/ListNotAllowed'
import CollectionDropdown from '../Collections/Dropdown'
import Headline from '../../Materialize/Headline'
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
import DataNotFound from '../Data404'
import { truncateName } from '@/utils'

const LOCALSTORAGE_PREFIX = 'current-list-view'
const LIST_VIEW_LIST = 'list'
const LIST_VIEW_BOXES = 'boxes'
const LIST_VIEW_MAP = 'map'
const LIST_VIEW_COLUMN = 'column'
const LIST_VIEW_TIME_SERIES = 'time-series'

export default {
  name: 'DocumentsPage',
  components: {
    CollectionDropdown,
    DeleteModal,
    Column,
    List,
    EmptyState,
    Headline,
    Filters,
    ListNotAllowed,
    NoResultsEmptyState,
    RealtimeOnlyEmptyState,
    DataNotFound
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      fetchingDocuments: false,
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
      resultPerPage: [10, 25, 50, 100, 500],
      currentPage: 1,
      indexOrCollectionNotFound: false
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
    currentPage: {
      handler(value) {
        const from = (value - 1) * this.paginationSize
        this.onFiltersUpdated(
          Object.assign(this.currentFilter, {
            from
          })
        )
      }
    },
    collection: {
      immediate: true,
      handler() {
        this.loadAllTheThings()
      }
    },
    index: {
      immediate: true,
      handler() {
        this.loadAllTheThings()
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
    truncateName,
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
      this.$router.push({ name: 'CreateDocument' })
    },

    // UPDATE
    // =========================================================================
    onEditDocumentClicked(id) {
      this.$router.push({
        name: 'UpdateDocument',
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
        this.$bvModal.hide('modal-delete')
        this.resetCandidatesForDeletion()
        this.fetchDocuments()
        this.deleteModalIsLoading = false
        this.$bvModal.hide('documentsDeleteModal')
      } catch (e) {
        this.$log.error(e)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while deleting the document(s).',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          }
        )
      }
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion.splice(0, this.candidatesForDeletion.length)
    },
    onBulkDeleteClicked() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(
        this.selectedDocuments
      )
      this.$bvModal.show('modal-delete')
    },
    onDeleteClicked(id) {
      this.candidatesForDeletion.push(id)
      this.$bvModal.show('modal-delete')
    },
    onRefresh() {
      this.fetchDocuments()
    },
    // LIST (FETCH & SEARCH)
    // =========================================================================
    loadAllTheThings() {
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
    },
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
        this.$bvToast.toast(e.message, {
          title: 'Ooops! Something went wrong while performing the search.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
        this.$log.error(e)
      }
    },
    onCollectionClear() {
      this.documents = []
      this.totalDocuments = 0
      this.currentFilter = new filterManager.Filter()
    },
    async fetchDocuments() {
      this.fetchingDocuments = true
      this.$forceUpdate()
      this.indexOrCollectionNotFound = false

      this.selectedDocuments = []

      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }
      try {
        let searchQuery = null
        searchQuery = filterManager.toSearchQuery(this.currentFilter)
        if (!searchQuery) {
          searchQuery = {}
        }

        const sorting = filterManager.toSort(this.currentFilter)

        // TODO: refactor how search is done
        // Execute search with corresponding searchQuery
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
        this.$log.error(e)
        if (e.status === 412) {
          this.indexOrCollectionNotFound = true
        } else if (e.message.includes('failed to create query')) {
          this.$bvToast.toast(
            'Your query is ill-formed. The complete error has been dumped to the console.',
            {
              title:
                'Ooops! Something went wrong while fetching the documents.',
              variant: 'warning',
              toaster: 'b-toaster-bottom-right',
              appendTouast: true,
              dismissible: true,
              noAutoHide: true
            }
          )
        } else {
          this.$bvToast.toast(e.message, {
            title: 'Ooops! Something went wrong while fetching the documents.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          })
        }
      }
      this.fetchingDocuments = false
    },

    // PAGINATION
    // =========================================================================
    changePaginationSize(size) {
      this.$log.debug(`changing pagination to ${size}`)
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
          if (dateFields.includes(field)) {
            const date = dateFromTimestamp(value)

            if (date) {
              document[field] += ` (${date.toUTCString()})`
            }
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

function dateFromTimestamp(value) {
  let timestamp

  if (typeof value === 'string') {
    timestamp = parseInt(value, 10)

    if (isNaN(timestamp)) {
      return null
    }
  } else if (Number.isInteger(value)) {
    timestamp = value
  } else {
    return null
  }

  const length = `${timestamp}`.length

  let date
  if (length === 10) {
    date = new Date(timestamp * 1000)
  } else if (length === 13) {
    date = new Date(timestamp)
  } else {
    return null
  }

  return date
}
</script>

<style lang="scss" scoped>
.DocumentList {
  margin-bottom: 5em;
}
.DocumentList--container {
  transition: max-width 0.6s;
}
.DocumentList--containerFluid {
  max-width: 100%;
}
.ResultPerPage {
  &--active {
    color: 'primary';
  }
  &--link {
    color: grey;
  }
}
</style>
