<template>
  <b-card
    class="Filters"
    :header-tag="advancedFiltersVisible ? 'nav' : 'div'"
    :no-body="!advancedFiltersVisible"
  >
    <template v-slot:header>
      <b-nav card-header tabs>
        <quick-filter
          v-if="!advancedFiltersVisible"
          style="flex-grow: 1"
          :advanced-query-label="advancedQueryLabel"
          :submit-button-label="submitButtonLabel"
          :complex-filter-active="complexFilterActive"
          :search-term="quickFilter"
          :advanced-filters-visible="advancedFiltersVisible"
          :enabled="quickFilterEnabled"
          :action-buttons-visible="actionButtonsVisible"
          @display-advanced-filters="
            advancedFiltersVisible = !advancedFiltersVisible
          "
          @update-filter="onQuickFilterUpdated"
          @refresh="onRefresh"
          @reset="onReset"
        />
        <template v-if="advancedFiltersVisible">
          <b-nav-item
            :active="complexFiltersSelectedTab === 'raw'"
            @click="complexFiltersSelectedTab = 'raw'"
            >Raw JSON Filter</b-nav-item
          >
          <b-nav-item
            :active="complexFiltersSelectedTab === 'basic'"
            @click="complexFiltersSelectedTab = 'basic'"
            >Advanced Filter</b-nav-item
          >

          <i
            class="Filters-btnClose fa fa-times close"
            @click="advancedFiltersVisible = false"
          />
        </template>
      </b-nav>
    </template>
    <template v-if="advancedFiltersVisible">
      <raw-filter
        v-if="complexFiltersSelectedTab === 'raw'"
        :raw-filter="rawFilter"
        :format-from-basic-search="formatFromBasicSearch"
        :sorting-enabled="sortingEnabled"
        :action-buttons-visible="actionButtonsVisible"
        :submit-button-label="submitButtonLabel"
        :current-filter="currentFilter"
        :refresh-ace="refreshace"
        @update-filter="onRawFilterUpdated"
        @reset="onReset"
      />
      <basic-filter
        v-if="complexFiltersSelectedTab === 'basic'"
        :toggle-auto-complete="toggleAutoComplete"
        :basic-filter="basicFilter"
        :sorting-enabled="sortingEnabled"
        :available-operands="availableOperands"
        :submit-button-label="submitButtonLabel"
        :action-buttons-visible="actionButtonsVisible"
        :sorting="sorting"
        :collection-mapping="collectionMapping"
        @update-filter="onBasicFilterUpdated"
        @reset="onReset"
      />
    </template>
  </b-card>
</template>

<style lang="scss" scoped>
.Filters-btnClose {
  cursor: pointer;
  color: grey;
  position: absolute;
  top: 15px;
  right: 15px;

  &:hover {
    color: #555;
    background: #eee;
    border-radius: 3px;
  }
}
.Filters-advanced {
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
      default: 'Search'
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
    },
    toggleAutoComplete: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      advancedFiltersVisible: false,
      complexFiltersSelectedTab: ACTIVE_RAW,
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
  mounted() {
    Vue.nextTick(() => {
      window.document.addEventListener('keydown', this.handleEsc)
    })
  },
  destroyed() {
    window.document.removeEventListener('keydown', this.handleEsc)
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
    setObjectTabActive(tab) {
      this.objectTabActive = tab
      this.refreshace = !this.refreshace
    },
    onFiltersUpdated(newFilters) {
      this.$emit('filters-updated', newFilters)
    }
  }
}
</script>
