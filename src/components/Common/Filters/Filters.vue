<template>
  <div class="search-filter">
    <div v-if="(!basicFilter && !rawFilter && !sorting) && simpleFilterEnabled" class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :simple-filter-term="simpleFilterTerm"
          :display-advanced-filter="displayAdvancedFilter"
          @display-advanced-filter="displayAdvancedFilter = !displayAdvancedFilter"
          @quick-search="broadcastFilterQuickSearch"
          @reset-search="onResetSearch">
        </quick-filter>
      </div>
    </div>

    <div v-if="(basicFilter || rawFilter || sorting) || !simpleFilterEnabled" class="complex-search card-panel card-header filters">
      <div class="row margin-bottom-0">
        <div class="col s8 m6 l4" style="min-width: 520px">
          <div class="search-bar">
            <i class="fa fa-search search"></i>
            <div v-if="!displayAdvancedFilter" class="chip">
              <span class="label-chip" @click.prevent="displayAdvancedFilter = true">{{advancedQueryLabel}}</span>
              <i class="close fa fa-close" v-if="simpleFilterEnabled" @click.prevent="resetComplexSearch"></i>
            </div>
            <a v-if="!displayAdvancedFilter" href="#" class="fluid-hover" @click.prevent="displayAdvancedFilter = true">More query options</a>
            <a v-else href="#" class="fluid-hover" @click.prevent="displayAdvancedFilter = false">Less query options</a>
          </div>
        </div>
        <div class="col s4 m3 l3 actions-quicksearch">
          <button type="submit" class="btn btn-small waves-effect waves-light" @click="refreshSearch">{{searchButtonText}}</button>
          <button class="btn-flat btn-small waves-effect waves-light" @click="resetComplexSearch">reset</button>
        </div>
      </div>
    </div>

    <div class="row card-panel open-search" v-show="displayAdvancedFilter">
      <i class="fa fa-times close" @click="displayAdvancedFilter = false"></i>
      <div class="col s12">
        <tabs @tab-changed="switchFilter" :active="tabActive" :is-displayed="displayAdvancedFilter" :object-tab-active="objectTabActive">
          <tab @tabs-on-select="setObjectTabActive" name="basic" tab-select="basic"><a href="">Basic Mode</a></tab>
          <tab @tabs-on-select="setObjectTabActive" name="raw" tab-select="basic"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-show="tabActive === 'basic'">
                <basic-filter
                  :basic-filter="basicFilter"
                  :sorting-enabled="sortingEnabled"
                  :available-filters="availableFilters"
                  :search-button-text="searchButtonText"
                  :sorting="sorting"
                  @filters-basic-search="broadcastFilterBasicSearch">
                </basic-filter>
              </div>

              <div v-show="tabActive === 'raw'">
                <raw-filter
                  :raw-filter="rawFilter"
                  :format-from-basic-search="formatFromBasicSearch"
                  :sorting-enabled="sortingEnabled"
                  :search-button-text="searchButtonText"
                  @filters-raw-search="broadcastRawSearch">
                </raw-filter>
              </div>
            </div>
          </div>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script>
  import Tabs from '../../Materialize/Tabs'
  import Tab from '../../Materialize/Tab'
  import QuickFilter from './QuickFilter'
  import BasicFilter from './BasicFilter'
  import RawFilter from './RawFilter'
  import Vue from 'vue'

  export default {
    name: 'Filters',
    props: {
      availableFilters: {
        type: Object,
        required: true
      },
      simpleFilterEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      sortingEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      searchButtonText: {
        type: String,
        required: false,
        'default': 'search'
      },
      advancedQueryLabel: {
        type: String,
        required: false,
        'default': 'Advanced query...'
      },
      rawFilter: Object,
      basicFilter: Array,
      simpleFilterTerm: String,
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
      'displayAdvancedFilter' () {
        this.$emit('json-editor-refresh')
      },
      'tabActive' () {
        this.$emit('json-editor-refresh')
      }
    },
    data () {
      return {
        displayAdvancedFilter: false,
        tabActive: 'basic',
        jsonInvalid: false,
        objectTabActive: null
      }
    },
    methods: {
      broadcastFilterQuickSearch (term) {
        console.log('broadcastFilterQuickSearch')
        this.$emit('quick-search', term)
      },
      switchFilter (name) {
        this.tabActive = name
      },
      resetComplexSearch () {
        this.$emit('raw-search', {})
      },
      refreshSearch () {
        console.log('refreshSearch')
        this.$emit('refresh-search')
      },
      broadcastFilterBasicSearch (filters, sorting) {
        this.displayAdvancedFilter = false
        this.$emit('basic-search', filters, sorting)
      },
      setObjectTabActive (tab) {
        this.objectTabActive = tab
      },
      broadcastRawSearch (filter) {
        this.$emit('raw-search', filter)
      },
      onResetSearch () {
        console.log('aaaa')
        this.$emit('reset-search')
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
