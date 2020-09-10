<template>
  <b-card
    :text-variant="
      complexFilterActive && !advancedFiltersVisible ? 'white' : 'dark'
    "
    :header-tag="advancedFiltersVisible ? 'nav' : 'div'"
    :no-body="!advancedFiltersVisible"
  >
    <template v-slot:header>
      <b-nav card-header tabs>
        <quick-filter
          v-if="!advancedFiltersVisible"
          style="flex-grow: 1"
          v-model="quickFilter"
          submit-button-label="Quick Search"
          :action-buttons-visible="actionButtonsVisible"
          :advanced-filters-visible="advancedFiltersVisible"
          :advanced-query-label="advancedQueryLabel"
          :complex-filter-active="complexFilterActive"
          :enabled="quickFilterEnabled"
          :initialValue="quickFilter"
          :placeholder="quickFilterPlaceholder"
          :submit-on-type="quickFilterSubmitOnType"
          @display-advanced-filters="
            advancedFiltersVisible = !advancedFiltersVisible
          "
          @filter-submitted="onQuickFilterSubmitted"
          @refresh="onRefresh"
          @reset="onReset"
          @enter-pressed="onEnterPressed"
        />
        <template v-if="advancedFiltersVisible">
          <b-nav-item
            data-cy="Filters-basicTab"
            :active="complexFiltersSelectedTab === 'basic'"
            @click="complexFiltersSelectedTab = 'basic'"
            ><i class="fas fa-filter"></i>&nbsp;Advanced</b-nav-item
          >
          <b-nav-item
            data-cy="Filters-rawTab"
            :active="complexFiltersSelectedTab === 'raw'"
            @click="complexFiltersSelectedTab = 'raw'"
            ><i class="fas fa-scroll"></i>&nbsp;Raw JSON</b-nav-item
          >
          <b-nav-item
            data-cy="Filters-historyTab"
            :active="complexFiltersSelectedTab === 'history'"
            @click="complexFiltersSelectedTab = 'history'"
            ><i class="fas fa-history"></i>&nbsp;History</b-nav-item
          >
          <b-nav-item
            data-cy="Filters-favoriteTab"
            :active="complexFiltersSelectedTab === 'favorite'"
            @click="complexFiltersSelectedTab = 'favorite'"
            ><i class="fas fa-star"></i>&nbsp;Saved</b-nav-item
          >
          <i
            data-cy="Filters-close"
            class="Filters-btnClose fa fa-times close"
            @click="advancedFiltersVisible = false"
          />
        </template>
      </b-nav>
    </template>
    <template v-if="advancedFiltersVisible">
      <raw-filter
        v-if="complexFiltersSelectedTab === 'raw'"
        submit-button-label="Raw JSON Search"
        :action-buttons-visible="actionButtonsVisible"
        :current-filter="currentFilter"
        :sorting-enabled="sortingEnabled"
        @filter-submitted="onRawFilterSubmitted"
        @reset="onReset"
      />
      <basic-filter
        v-if="complexFiltersSelectedTab === 'basic'"
        submit-button-label="Advanced Search"
        :action-buttons-visible="actionButtonsVisible"
        :available-operands="availableOperands"
        :basic-filter="basicFilter"
        :mapping-attributes="mappingAttributes"
        :sorting="sorting"
        :sorting-enabled="sortingEnabled"
        @filter-submitted="onBasicFilterSubmitted"
        @generate-raw-filter="onGenerateRawFilter"
        @reset="onReset"
      />
      <history-filter
        v-if="complexFiltersSelectedTab === 'history'"
        :index="index"
        :collection="collection"
        @filter-basic-submitted="onBasicFilterSubmitted"
        @filter-raw-submitted="onRawFilterSubmitted"
      />
      <favorite-filters
        v-if="complexFiltersSelectedTab === 'favorite'"
        :index="index"
        :collection="collection"
        @filter-basic-submitted="onBasicFilterSubmitted"
        @filter-raw-submitted="onRawFilterSubmitted"
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
import HistoryFilter from './HistoryFilter'
import FavoriteFilters from './FavoriteFilters'

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
    RawFilter,
    HistoryFilter,
    FavoriteFilters
  },
  props: {
    index: {
      type: String,
      required: true
    },
    collection: {
      type: String,
      required: true
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true
    },
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...'
    },
    availableOperands: {
      type: Object,
      required: true
    },
    mappingAttributes: {
      type: Object,
      required: true
    },
    currentFilter: Object,
    formatFromBasicSearch: Function,
    quickFilterEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    quickFilterPlaceholder: {
      type: String
    },
    quickFilterSubmitOnType: {
      type: Boolean,
      default: true
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true
    },
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'Search'
    },
    toggleAutoComplete: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      advancedFiltersVisible: false,
      complexFiltersSelectedTab: ACTIVE_BASIC,
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
    quickFilter: {
      get() {
        if (!this.currentFilter) {
          return null
        }

        return this.currentFilter.quick
      },
      set(value) {
        this.currentFilter.quick = value
      }
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
    onQuickFilterSubmitted(term) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: term ? ACTIVE_QUICK : NO_ACTIVE,
          quick: term
        })
      )
      this.onSubmit()
    },
    onBasicFilterSubmitted(filter, sorting, loadedFromHistory) {
      const newFilter = new Filter()
      newFilter.basic = filter
      newFilter.active = filter ? ACTIVE_BASIC : NO_ACTIVE
      newFilter.sorting = sorting
      this.onFiltersUpdated(newFilter, loadedFromHistory)
      this.onSubmit()
    },
    onGenerateRawFilter(raw) {
      this.onRawFilterUpdated(raw, false)
      this.complexFiltersSelectedTab = 'raw'
    },
    onRawFilterUpdated(filter, loadedFromHistory) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: filter ? ACTIVE_RAW : NO_ACTIVE,
          raw: filter
        }),
        loadedFromHistory
      )
    },
    onRawFilterSubmitted(filter, loadedFromHistory) {
      this.advancedFiltersVisible = false
      this.onRawFilterUpdated(filter, loadedFromHistory)
      this.onSubmit()
    },
    onRefresh() {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from: 0
        })
      )
      this.submit()
    },
    onReset() {
      this.advancedFiltersVisible = false
      this.$emit('reset', new Filter())
    },
    setObjectTabActive(tab) {
      this.objectTabActive = tab
      this.refreshace = !this.refreshace
    },
    onFiltersUpdated(newFilters, loadedFromHistory) {
      this.$emit('filters-updated', newFilters, loadedFromHistory)
    },
    onSubmit() {
      this.advancedFiltersVisible = false
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from: 0
        }),
        false
      )
      this.$emit('submit')
    },
    onEnterPressed() {
      this.$emit('enter-pressed')
    }
  }
}
</script>
