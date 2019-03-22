<template>
  <div class="Filters">

    <quick-filter
      :advanced-query-label="advancedQueryLabel"
      :submit-button-label="submitButtonLabel"
      :complex-filter-active="complexFilterActive"
      :search-term="quickFilter"
      :advanced-filters-visible="advancedFiltersVisible"
      :enabled="quickFilterEnabled"
      :action-buttons-visible="actionButtonsVisible"
      @display-advanced-filters="advancedFiltersVisible = !advancedFiltersVisible"
      @update-filter="onQuickFilterUpdated"
      @refresh="onRefresh"
      @reset="onReset">
    </quick-filter>


    <div class="row card-panel Filters-advanced" v-show="advancedFiltersVisible">
      <i class="Filters-btnClose fa fa-times close" @click="advancedFiltersVisible = false"></i>
      <tabs @tab-changed="switchComplexFilterTab" :active="complexFiltersSelectedTab" :is-displayed="advancedFiltersVisible" :object-tab-active="objectTabActive">
        <tab @tabs-on-select="setObjectTabActive" name="basic" tab-select="basic"><a href="">Basic Mode</a></tab>
        <tab @tabs-on-select="setObjectTabActive" name="raw" tab-select="basic"><a href="">Raw JSON Mode</a></tab>

        <div slot="contents" class="card">
          <div class="col s12">
            <div v-show="complexFiltersSelectedTab === 'basic'">
              <basic-filter
                :basic-filter="basicFilter"
                :sorting-enabled="sortingEnabled"
                :available-operands="availableOperands"
                :submit-button-label="submitButtonLabel"
                :action-buttons-visible="actionButtonsVisible"
                :sorting="sorting"
                :collection-mapping="collectionMapping"
                @update-filter="onBasicFilterUpdated"
                @reset="onReset">
              </basic-filter>
            </div>

            <div v-show="complexFiltersSelectedTab === 'raw'">
              <raw-filter
                :raw-filter="rawFilter"
                :format-from-basic-search="formatFromBasicSearch"
                :sorting-enabled="sortingEnabled"
                :action-buttons-visible="actionButtonsVisible"
                :submit-button-label="submitButtonLabel"
                :current-filter="currentFilter"
                :refresh-ace="refreshace"
                @update-filter="onRawFilterUpdated"
                @reset="onReset">
              </raw-filter>
            </div>
          </div>
        </div>
      </tabs>
    </div>

    <div class="card-panel orange lighten-3" v-show="currentFilter.active">
      <span>Warning: a filter has been set, some documents might be hidden.</span>
    </div>

  </div>

</template>

<style lang="scss" scoped>
.Filters-advanced {
  background-color: #fff;
  padding-top: 0;
  padding-right: 30px;
  padding-bottom: 0;
  margin-top: 0;
  position: relative;

  .Filters-btnClose {
    float: right;
    font-size: 1.3em;
    cursor: pointer;
    color: grey;
    position: absolute;
    top: 10px;
    right: 16px;

    &:hover {
      color: #555;
      background: #eee;
      border-radius: 3px;
    }
  }

  .card-action {
    padding: 15px;
    margin-bottom: 0;
    button {
      margin-right: 10px;
    }
  }

  .select-wrapper span.caret {
    top: 10px;
  }
}
</style>

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
  ACTIVE_RAW,
  Filter
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
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...'
    },
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'search'
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true
    },
    availableOperands: {
      type: Object,
      required: true
    },
    quickFilterEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    currentFilter: Object,
    formatFromBasicSearch: Function,
    collectionMapping: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      advancedFiltersVisible: false,
      complexFiltersSelectedTab: null,
      jsonInvalid: false,
      objectTabActive: null,
      refreshace: false
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
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: term ? ACTIVE_QUICK : NO_ACTIVE,
          quick: term,
          from: 0
        })
      )
    },
    onBasicFilterUpdated(filter, sorting) {
      const newFilter = new Filter()
      newFilter.basic = filter
      newFilter.active = filter ? ACTIVE_BASIC : NO_ACTIVE
      newFilter.sorting = sorting
      newFilter.from = 0
      this.onFiltersUpdated(newFilter)
    },
    onRawFilterUpdated(filter) {
      this.advancedFiltersVisible = false
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: filter ? ACTIVE_RAW : NO_ACTIVE,
          raw: filter,
          from: 0
        })
      )
    },
    onRefresh() {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from: 0
        })
      )
    },
    onReset() {
      this.$emit('reset', new Filter())
    },
    switchComplexFilterTab(name) {
      this.complexFiltersSelectedTab = name
    },
    setObjectTabActive(tab) {
      this.objectTabActive = tab
      this.refreshace = !this.refreshace
    },
    onFiltersUpdated(newFilters) {
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
  }
}
</script>
