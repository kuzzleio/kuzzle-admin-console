<template>
  <div class="search-filter">
    <div class="row margin-bottom-0 filters">
      <basic-filter
              :basic-filter="basicFilter"
              :sorting-enabled="sortingEnabled"
              :available-filters="availableFilters"
              :label-search-button="labelSearchButton"
              :sorting="sorting"
              :set-basic-filter="setBasicFilter"
              @filters-basic-search="broadcastFilterBasicSearch">
      </basic-filter>
    </div>
  </div>
</template>

<script>
  import Tabs from '../../Materialize/Tabs'
  import Tab from '../../Materialize/Tab'
  import QuickFilter from '../Common/Filters/QuickFilter'
  import BasicFilter from './Filters/BasicFilter'
  import RawFilter from '../Common/Filters/RawFilter'
  import Vue from 'vue'

  export default {
    name: 'Filters',
    props: {
      availableFilters: {
        type: Object,
        required: true
      },
      quickFilterEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      sortingEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      labelSearchButton: {
        type: String,
        required: false,
        'default': 'search'
      },
      labelComplexQuery: {
        type: String,
        required: false,
        'default': 'Complex query here'
      },
      rawFilter: Object,
      basicFilter: Object,
      setBasicFilter: Function,
      searchTerm: String,
      sorting: Object,
      formatFromBasicSearch: Function
    },
    components: {
      Tabs,
      Tab,
      QuickFilter,
      BasicFilter,
      RawFilter
    },
    watch: {
      'displayBlockFilter' () {
        this.$emit('json-editor-refresh')
      },
      'tabActive' () {
        this.$emit('json-editor-refresh')
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        tabActive: 'basic',
        jsonInvalid: false,
        objectTabActive: null
      }
    },
    methods: {
      broadcastFilterQuickSearch (term) {
        this.$emit('filters-quick-search', term)
      },
      switchFilter (name) {
        this.tabActive = name
      },
      resetComplexSearch () {
        this.$emit('filters-raw-search', {})
      },
      refreshSearch () {
        this.$emit('filters-refresh-search')
      },
      broadcastFilterBasicSearch (filters, sorting) {
        this.displayBlockFilter = false
        this.$emit('filters-basic-search', filters, sorting)
      },
      setObjectTabActive (tab) {
        this.objectTabActive = tab
      },
      broadcastRawSearch (filter) {
        this.$emit('filters-raw-search', filter)
      }
    },
    mounted () {
      Vue.nextTick(() => {
        window.document.addEventListener('keydown', this.handleEsc)
      })
    },
    destroyed () {
      window.document.removeEventListener('keydown', this.handleEsc)
    }
  }
</script>
