<template>
  <div class="search-filter">
    <div class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :complex-filter-active="complexFilterActive"
          :search-term="quickFilter"
          :advanced-filters-visible="advancedFiltersVisible"
          @display-advanced-filters="advancedFiltersVisible = !advancedFiltersVisible"
          @update-filter="onQuickFilterUpdated">
        </quick-filter>
      </div>
    </div>

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
                  @update-filter="onBasicFilterUpdated">
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
import {
  NO_ACTIVE,
  ACTIVE_QUICK,
  ACTIVE_BASIC,
  ACTIVE_RAW
  // ACTIVE_RAW
} from '../../../services/filterManager'

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
    currentFilter: Object,
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
    complexFilterActive() {
      return (
        (this.currentFilter.active === ACTIVE_BASIC &&
          this.currentFilter.basic !== null) ||
        (this.currentFilter.active === ACTIVE_RAW &&
          this.currentFilter.raw !== null)
      )
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
    },
    sorting() {
      return this.currentFilter.sorting
    }
  },
  methods: {
    onQuickFilterUpdated(term) {
      console.log('onQuickFilterUpdated')
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: term ? ACTIVE_QUICK : NO_ACTIVE,
          quick: term
        })
      )
    },
    onBasicFilterUpdated(filter, sorting) {
      console.log('onBasicFilterUpdated')
      this.advancedFiltersVisible = false
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: filter ? ACTIVE_BASIC : NO_ACTIVE,
          basic: filter,
          sorting
        })
      )
    },
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
    setObjectTabActive(tab) {
      this.objectTabActive = tab
    },
    // TODO
    broadcastRawSearch(filter) {
      this.$emit('raw-search', filter)
    },
    onFiltersUpdated(newFilters, sorting) {
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
