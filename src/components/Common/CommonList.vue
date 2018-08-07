<template>
  <div>
    <slot name="emptySet" v-if="isCollectionEmpty"></slot>
    <crudl-document v-else
      :available-filters="availableFilters"
      :pagination-from="paginationFrom"
      :sorting="sorting"
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
      @filters-updated="onFiltersUpdated"
      @create-clicked="create"
      @toggle-all="toggleAll"
      @crudl-refresh-search="fetchDocuments">

        <div class="collection">
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

<style lang="scss" rel="stylesheet/scss" scoped>
.collection {
  overflow: visible;
}
</style>

<script>
import CrudlDocument from './CrudlDocument'
import UserItem from '../Security/Users/UserItem'
import RoleItem from '../Security/Roles/RoleItem'
import ProfileItem from '../Security/Profiles/ProfileItem'
import DocumentItem from '../Data/Documents/DocumentItem'
import {
  formatFromQuickSearch,
  formatFromBasicSearch,
  formatSort,
  availableFilters
} from '../../services/filterFormat'
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
    routeUpdate: String
  },

  data() {
    return {
      availableFilters,
      selectedDocuments: [],
      documents: [],
      totalDocuments: 0,
      documentToDelete: null,
      currentFilter: new Filter()
    }
  },
  computed: {
    isDocumentListFiltered() {
      return this.currentFilter.active !== NO_ACTIVE
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
    currentfilterKey() {
      return this.index + '/' + this.collection
    },
    sorting() {
      if (!this.$store.state.route.query.sorting) {
        return null
      }

      try {
        return JSON.parse(this.$store.state.route.query.sorting)
      } catch (e) {
        return []
      }
    },
    paginationFrom() {
      return parseInt(this.$store.state.route.query.from) || 0
    },
    paginationSize() {
      return parseInt(this.$store.state.route.query.size) || 10
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
      console.log('CommonList::onFiltersUpdated')
      filterManager.save(newFilters, this.$router, this.index, this.collection)
    },
    // onResetSearch() {
    //   console.log('reset search')
    //   this.currentFilter.activeFilter = 'None'
    //   this.storeCurrentFilter('None')
    //   this.forceRecomputeFilters++ // Hack to force recompute filters dans changing active index/collection, or reseting the filters

    //   this.$router.push({ query: {} })
    //   this.fetchDocuments()
    // },

    fetchDocuments() {
      this.$forceUpdate()
      console.log('fetch data...')
      console.log(this.$store.state.route.query)

      this.selectedDocuments = []

      let filters = null
      let sorting = ['_uid'] // by default, sort on uid: prevent random order
      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      // Manage query quickSearch/basicSearch/rawSearch
      if (this.quickFilter) {
        console.log('use quickFilter')
        filters = formatFromQuickSearch(this.quickFilter)
        this.storeCurrentFilter('quickFilter', this.quickFilter)
      } else if (this.basicFilter) {
        console.log('use basicFilter')
        filters = formatFromBasicSearch(this.basicFilter)
        this.storeCurrentFilter('basicFilter', this.basicFilter)
      } else if (this.rawFilter) {
        console.log('use rawFilter')
        filters = this.rawFilter
        this.storeCurrentFilter('rawFilter', this.rawFilter)
        if (filters.sort) {
          sorting = filters.sort
        }
      }

      if (this.sorting) {
        sorting = formatSort(this.sorting)
      }

      // if (!filters) {
      //   console.log(
      //     "No active filter, it's time to restore the one from local storage!!!"
      //   )
      //   this.restoreCurrentFilter()
      //   if (this.currentFilter.activeFilter === 'quickFilter') {
      //     filters = formatFromQuickSearch(this.currentFilter.quickFilter)
      //   } else if (this.currentFilter.activeFilter === 'basicFilter') {
      //     filters = formatFromQuickSearch(this.currentFilter.basicFilter)
      //   } else if (this.currentFilter.activeFilter === 'rawFilter') {
      //     filters = this.currentFilter.rawFilter
      //     if (filters.sort) {
      //       sorting = filters.sort
      //     }
      //   }
      // }

      if (!filters) {
        filters = {}
      }

      // this.updateSearchRouteParams(filters)

      console.log('fetchDocuments: filter = ' + JSON.stringify(filters))
      // TODO: refactor how search is done
      // Execute search with corresponding filters
      this.performSearch(
        this.collection,
        this.index,
        filters,
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
      this.$store
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
        console.log('CommonList:: detected route change')
        this.currentFilter = filterManager.loadFromRoute(this.$store)
        filterManager.saveToLocalStorage(
          this.currentFilter,
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

class FilterManager {
  load(index, collection, store) {
    if (!index || !collection) {
      throw new Error(
        'Cannot load filters if no index or collection are specfied'
      )
    }
    console.log('Loading filters...')
    let loadedFilter = this.loadFromRoute(store)

    if (loadedFilter.active === NO_ACTIVE) {
      console.log('nothing found in URL, looking in LocalStorage')
      loadedFilter = this.loadFromLocalStorage(index, collection)
    }

    return loadedFilter
  }

  loadFromRoute(store) {
    let filter = new Filter()

    if (store.state.route.query.searchTerm) {
      console.log('found searchTerm in route')
      filter.quick = store.state.route.query.searchTerm
      filter.active = ACTIVE_QUICK
    } else if (store.state.route.query.basicFilter) {
      filter.quick = store.state.route.query.basicFilter
      filter.active = ACTIVE_BASIC
    } else if (store.state.route.query.rawFilter) {
      filter.quick = store.state.route.query.rawFilter
      filter.active = ACTIVE_RAW
    }

    console.log('filters found in route')
    console.log(filter)

    return filter
  }

  loadFromLocalStorage(index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot load filters from localstorage if no index or collection are specfied'
      )
    }
    const filterStr = localStorage.getItem(
      `search-filter-current:${index}/${collection}`
    )
    if (filterStr) {
      return JSON.parse(filterStr)
    }

    return new Filter()
  }

  save(filter, router, index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot save filters if no index or collection are specfied'
      )
    }
    this.saveToRouter(filter, router)
    this.saveToLocalStorage(filter, index, collection)
  }

  saveToRouter(filter, router) {
    switch (filter.active) {
      case ACTIVE_QUICK:
        router.push({ query: { searchTerm: filter.quick, from: 0 } })
        break
      case NO_ACTIVE:
      default:
        router.push({ query: {} })
        break

      // TODO other cases...
    }
  }

  saveToLocalStorage(filter, index, collection) {
    if (!index || !collection) {
      throw new Error(
        'Cannot save filters to localstorage if no index or collection are specfied'
      )
    }
    localStorage.setItem(
      `search-filter-current:${index}/${collection}`,
      JSON.stringify(filter)
    )
  }
}

const NO_ACTIVE = null
const ACTIVE_QUICK = 'quick'
const ACTIVE_BASIC = 'basic'
const ACTIVE_RAW = 'raw'

function Filter() {
  this.active = NO_ACTIVE
  this.quick = ''
  this.basic = []
  this.raw = {}
}

const filterManager = new FilterManager()
</script>
