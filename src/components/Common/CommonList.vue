<template>
  <div>
    Hello, this is a CommonList
    <slot name="emptySet" v-if="isCollectionEmpty"></slot>
    <crudl-document v-else
      :available-filters="availableFilters"
      :pagination-from="paginationFrom"
      :sorting="sorting"
      :basic-filter="basicFilter"
      :raw-filter="rawFilter"
      :search-term="quickFilter"
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
      @create-clicked="create"
      @toggle-all="toggleAll"
      @crudl-refresh-search="fetchData"
      @reset-search="onResetSearch">

        <div class="collection">
          <div class="collection-item collection-transition" v-for="document in documents" :key="document.id">
            <component :is="itemName"
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
  import { formatFromQuickSearch, formatFromBasicSearch, formatSort, availableFilters } from '../../services/filterFormat'
  import {SET_TOAST} from '../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'CommonList',
    created () {
      this.restoreCurrentFilter()
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
    components: {
      CrudlDocument,
      UserItem,
      RoleItem,
      ProfileItem,
      DocumentItem
    },
    data () {
      return {
        availableFilters,
        selectedDocuments: [],
        documents: [],
        totalDocuments: 0,
        documentToDelete: null,
        currentFilters: {},  // Store a map of currents filter: keys are 'index/collection'
        forceRecomputeFilters: 0
      }
    },
    computed: {
      isDocumentListFiltered () {
        return this.basicFilter || this.rawFilter || this.sorting || this.quickFilter
      },
      isCollectionEmpty () {
        return !(this.isDocumentListFiltered) && this.totalDocuments === 0
      },
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      },
      allChecked () {
        if (!this.selectedDocuments || !this.documents) {
          return false
        }

        return this.selectedDocuments.length === this.documents.length
      },
      currentfilterKey () {
        return this.index + '/' + this.collection
      },
      quickFilter () {     
        this.forceRecomputeFilters // Hack to force recompute filters dans changing active index/collection, or reseting the filters   
        if (this.$store.state.route.query.searchTerm) {
          console.log('using quickFilter from router...')
          return this.$store.state.route.query.searchTerm
        } else {
          console.log('using quickFilter from currentfilter...')
          return this.getCurrentFilter(this.currentfilterKey, 'quickFilter')
        }
      },
      basicFilter () {
        this.forceRecomputeFilters // Hack to force recompute filters dans changing active index/collection, or reseting the filters   
        try {
          return JSON.parse(this.$store.state.route.query.basicFilter)
        } catch (e) {
          return this.getCurrentFilter(this.currentfilterKey, 'basicFilter')
        }
      },
      rawFilter () {
        this.forceRecomputeFilters // Hack to force recompute filters dans changing active index/collection, or reseting the filters   
        try {
          return JSON.parse(this.$store.state.route.query.rawFilter)
        } catch (e) {
          return this.getCurrentFilter(this.currentfilterKey, 'rawFilter')
        }
      },
      sorting () {
        if (!this.$store.state.route.query.sorting) {
          return null
        }

        try {
          return JSON.parse(this.$store.state.route.query.sorting)
        } catch (e) {
          return []
        }
      },
      paginationFrom () {
        return parseInt(this.$store.state.route.query.from) || 0
      },
      paginationSize () {
        return parseInt(this.$store.state.route.query.size) || 10
      },
      currentFilter: {
        get () {
          let currentFilterKey = this.index + '/' + this.collection
          console.log('currentFilter\'s key: ' + currentFilterKey)
          if (typeof this.currentFilters[currentFilterKey] === 'undefined') {
            this.currentFilters[currentFilterKey] = {
              activeFilter: 'None',
              quickFilter: null,
              basicFilter: null,
              rawFilter: null
            }
          }
          return this.currentFilters[currentFilterKey]
        },
        set (value) {
          let currentFilterKey = this.index + '/' + this.collection
          Object.assign(this.currentFilters[currentFilterKey], value)
        }
      }
    },
    methods: {
      isChecked (id) {
        return this.selectedDocuments.indexOf(id) > -1
      },
      toggleAll () {
        if (this.allChecked) {
          this.selectedDocuments = []
          return
        }
        this.selectedDocuments = []
        this.selectedDocuments = this.documents.map((document) => document.id)
      },
      toggleSelectDocuments (id) {
        let index = this.selectedDocuments.indexOf(id)

        if (index === -1) {
          this.selectedDocuments.push(id)
          return
        }

        this.selectedDocuments.splice(index, 1)
      },
      hasSearchFilters () {
        return (this.$store.state.route.query.searchTerm !== '' ||
         this.basicFilter.length > 0 ||
         this.rawFilter.length > 0
        )
      },

      storeCurrentFilter (activeFilter, filter) {
        this.currentFilter = {activeFilter}
        if (['quickFilter', 'basicFilter', 'rawFilter'].indexOf(activeFilter) !== -1) {
          this.currentFilter = {[activeFilter]: filter}
        }
        localStorage.setItem(`search-filter-current:${this.index}/${this.collection}`, JSON.stringify(this.currentFilter))
        console.log('this.storeCurrentFilter:' + JSON.stringify(this.currentFilter))
      },

      restoreCurrentFilter () {
        console.log('<restoreCurrentFilter>')
        let currentFilterStr = localStorage.getItem(`search-filter-current:${this.index}/${this.collection}`)
        if (currentFilterStr) {
          Object.assign(this.currentFilter, JSON.parse(currentFilterStr))
          console.log(this.currentFilter)
        }
      },

      getCurrentFilter (filterKey, activeFilter) {
        console.log('getCurrentFilter(' + activeFilter + ')') 
        if (this.currentFilter.activeFilter === activeFilter) {
          console.log(' ->: ' + this.currentFilter[activeFilter]) 
          return this.currentFilter[activeFilter]
        } else {
          console.log(' ->: null') 
          return null
        }
      },

      onResetSearch () {
        console.log('reset search')
        this.currentFilter.activeFilter = 'None'
        this.storeCurrentFilter('None')
        this.forceRecomputeFilters++ // Hack to force recompute filters dans changing active index/collection, or reseting the filters   

        this.$router.push({query: {}})
        this.fetchData()
      },

      fetchData () {
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

        if (!filters) {
          console.log('No active filter, it\'s time to restore the one from local storage!!!')
          this.restoreCurrentFilter()
          if (this.currentFilter.activeFilter === 'quickFilter') {
            filters = formatFromQuickSearch(this.currentFilter.quickFilter)
          } else if (this.currentFilter.activeFilter === 'basicFilter') {
            filters = formatFromQuickSearch(this.currentFilter.basicFilter)
          } else if (this.currentFilter.activeFilter === 'rawFilter') {
            filters = this.currentFilter.rawFilter
            if (filters.sort) {
              sorting = filters.sort
            }
          }
        }

        if (!filters) {
          filters = {}
        }

        console.log('fetchData: filter = ' + JSON.stringify(filters))
        // TODO: refactor how search is done
        // Execute search with corresponding filters
        this.performSearch(this.collection, this.index, filters, pagination, sorting)
          .then(res => {
            this.documents = res.documents
            this.totalDocuments = res.total
          })
          .catch((e) => {
            this.$store.commit(SET_TOAST, {text: 'An error occurred while performing search: <br />' + e.message})
          })
      },
      editDocument (route, id) {
        this.$router.push({name: this.routeUpdate, params: {id: encodeURIComponent(id)}})
      },
      deleteDocument (id) {
        this.documentToDelete = id
      },
      refreshSearch () {
        this.fetchData()
      },
      create (route) {
        this.$router.push({name: this.routeCreate})
      }
    },
    mounted () {
      this.fetchData()
    },
    watch: {
      '$route' () {
        this.refreshSearch()
      }
    }
  }
</script>
