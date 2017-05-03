<template>
  <div class="search-filter">
    <div v-if="(!basicFilter && !rawFilter && !sorting) && quickFilterEnabled" class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :search-term="searchTerm"
          :display-block-filter="displayBlockFilter"
          @filters-display-block-filter="displayBlockFilter = !displayBlockFilter"
          @filters-quick-search="broadcastFilterQuickSearch">
        </quick-filter>
      </div>
    </div>

    <div v-if="(basicFilter || rawFilter || sorting) || !quickFilterEnabled" class="complex-search card-panel card-header filters">
      <div class="row margin-bottom-0">
        <div class="col s8 m6 l4" style="min-width: 520px">
          <div class="search-bar">
            <i class="fa fa-search search"></i>
            <div class="chip">
              <span class="label-chip" @click.prevent="displayBlockFilter = true">{{labelComplexQuery}}</span>
              <i class="close fa fa-close" v-if="quickFilterEnabled" @click.prevent="resetComplexSearch"></i>
            </div>
            <a v-if="!displayBlockFilter" href="#" class="fluid-hover" @click.prevent="displayBlockFilter = true">More query options</a>
            <a v-else href="#" class="fluid-hover" @click.prevent="displayBlockFilter = false">Less query options</a>
          </div>
        </div>
        <div class="col s4 m3 l3 actions-quicksearch">
          <button type="submit" class="btn btn-small waves-effect waves-light" @click="refreshSearch">{{labelSearchButton}}</button>
          <button class="btn-flat btn-small waves-effect waves-light" @click="resetComplexSearch">reset</button>
        </div>
      </div>
    </div>

    <div class="row card-panel open-search" v-show="displayBlockFilter">
      <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
      <div class="col s12">
        <tabs @tab-changed="switchFilter" :active="tabActive" :is-displayed="displayBlockFilter" :object-tab-active="objectTabActive">
          <tab @tabs-on-select="setObjectTabActive" name="basic" tab-select="basic"><a href="">Basic Mode</a></tab>
          <tab @tabs-on-select="setObjectTabActive" name="raw" tab-select="basic"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-show="tabActive === 'basic'">
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

              <div v-show="tabActive === 'raw'">
                <raw-filter
                  :raw-filter="rawFilter"
                  :format-from-basic-search="formatFromBasicSearch"
                  :sorting-enabled="sortingEnabled"
                  :label-search-button="labelSearchButton"
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
      basicFilter: Array,
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
