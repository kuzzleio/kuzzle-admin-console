<template>
  <div class="search-filter">
    <div class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :search-term="quickFilter"
          :advanced-filters-visible="advancedFiltersVisible"
          @display-advanced-filters="advancedFiltersVisible = !advancedFiltersVisible"
          @update-filter="onQuickFilterUpdated">
        </quick-filter>
      </div>
    </div>

    <!-- TODO move this into quick-filter!!!

      <div v-if="(basicFilter || rawFilter || sorting) || !simpleFilterEnabled" class="complex-search card-panel card-header filters">
      <div class="row margin-bottom-0">
        <div class="col s8 m6 l4" style="min-width: 520px">
          <div class="search-bar">
            <i class="fa fa-search search"></i>
            <div v-if="!advancedFiltersVisible" class="chip">
              <span class="label-chip" @click.prevent="advancedFiltersVisible = true">{{advancedQueryLabel}}</span>
              <i class="close fa fa-close" v-if="simpleFilterEnabled" @click.prevent="resetComplexSearch"></i>
            </div>
            <a v-if="!advancedFiltersVisible" href="#" class="fluid-hover" @click.prevent="advancedFiltersVisible = true">More query options</a>
            <a v-else href="#" class="fluid-hover" @click.prevent="advancedFiltersVisible = false">Less query options</a>
          </div>
        </div>
        <div class="col s4 m3 l3 actions-quicksearch">
          <button type="submit" class="btn btn-small waves-effect waves-light" @click="refreshSearch">{{searchButtonText}}</button>
          <button class="btn-flat btn-small waves-effect waves-light" @click="resetComplexSearch">reset</button>
        </div>
      </div>
    </div> -->

    <div class="row card-panel open-search" v-show="advancedFiltersVisible">
      <i class="fa fa-times close" @click="advancedFiltersVisible = false"></i>
      <div class="col s12">
        <tabs @tab-changed="switchFilter" :active="advancedFilterActiveTab" :is-displayed="advancedFiltersVisible" :object-tab-active="objectTabActive">
          <tab @tabs-on-select="setObjectTabActive" name="basic" tab-select="basic"><a href="">Basic Mode</a></tab>
          <tab @tabs-on-select="setObjectTabActive" name="raw" tab-select="basic"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-show="advancedFilterActiveTab === 'basic'">
                <basic-filter
                  :basic-filter="basicFilter"
                  :sorting-enabled="sortingEnabled"
                  :available-filters="availableFilters"
                  :search-button-text="searchButtonText"
                  :sorting="sorting"
                  @filters-basic-search="broadcastFilterBasicSearch">
                </basic-filter>
              </div>

              <div v-show="advancedFilterActiveTab === 'raw'">
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
  components: {
    Tabs,
    Tab,
    QuickFilter,
    BasicFilter,
    RawFilter
  },
  props: {
    availableFilters: {
      type: Object,
      required: true
    },
    simpleFilterEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    searchButtonText: {
      type: String,
      required: false,
      default: 'search'
    },
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...'
    },
    currentFilter: Object,
    sorting: Object,
    formatFromBasicSearch: Function
  },
  data() {
    return {
      advancedFiltersVisible: false,
      advancedFilterActiveTab: 'basic',
      jsonInvalid: false,
      objectTabActive: null
    }
  },
  computed: {
    quickFilterActive() {
      return this.currentFilter.active === 'quick'
    },
    quickFilter() {
      if (!this.currentFilter) {
        return null
      }
      return this.currentFilter.quick
    },
    basicFilter() {
      if (!this.currentFilter) {
        return null
      }
      return this.currentFilter.basic
    },
    rawFilter() {
      if (!this.currentFilter) {
        return null
      }
      return this.currentFilter.raw
    }
  },
  methods: {
    onQuickFilterUpdated(term) {
      console.log('onQuickFilterUpdated')
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: term ? 'quick' : null,
          quick: term
        })
      )
    },
    onBasicFilterUpdated(filter) {},
    onRawFilterUpdated(filter) {},
    switchFilter(name) {
      this.advancedFilterActiveTab = name
    },
    // TODO
    resetComplexSearch() {
      this.$emit('raw-search', {})
    },
    // ??
    refreshSearch() {
      console.log('refreshSearch')
      this.$emit('refresh-search')
    },
    // TODO
    broadcastFilterBasicSearch(filters, sorting) {
      this.advancedFiltersVisible = false
      this.$emit('basic-search', filters, sorting)
    },
    setObjectTabActive(tab) {
      this.objectTabActive = tab
    },
    // TODO
    broadcastRawSearch(filter) {
      this.$emit('raw-search', filter)
    },
    // TODO
    // onResetSearch() {
    //   this.$emit('reset-search')
    // },
    onFiltersUpdated(newFilters) {
      console.log('Filters::onFiltersUpdated')
      this.$emit('filters-updated', newFilters)
    }
  },
  mounted() {
    Vue.nextTick(() => {
      window.document.addEventListener('keydown', this.handleEsc)
    })
  },
  destroyed() {
    window.document.removeEventListener('keydown', this.handleEsc)
  },
  watch: {
    advancedFiltersVisible() {
      this.$emit('json-editor-refresh')
    },
    advancedFilterActiveTab() {
      this.$emit('json-editor-refresh')
    }
  }
}
</script>
