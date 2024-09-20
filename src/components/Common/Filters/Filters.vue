<template>
  <b-card
    data-cy="Filters"
    :class="{ 'full-screen': isFullscreen && advancedFiltersVisible }"
    :header-tag="advancedFiltersVisible ? 'nav' : 'div'"
    :no-body="!advancedFiltersVisible"
    :text-variant="complexFilterActive && !advancedFiltersVisible ? 'white' : 'dark'"
  >
    <template #header>
      <b-nav card-header tabs>
        <quick-filter
          v-if="!advancedFiltersVisible"
          style="flex-grow: 1"
          submit-button-label="Quick Search"
          :action-buttons-visible="actionButtonsVisible"
          :advanced-filters-visible="advancedFiltersVisible"
          :advanced-query-label="advancedQueryLabel"
          :complex-filter-active="complexFilterActive"
          :enabled="quickFilterEnabled"
          :placeholder="quickFilterPlaceholder"
          :submit-on-type="quickFilterSubmitOnType"
          :value="quickFilter"
          @display-advanced-filters="advancedFiltersVisible = !advancedFiltersVisible"
          @input="onQuickFilterUpdated"
          @reset="onReset"
          @submit="onQuickFilterSubmitted"
        />
        <template v-if="advancedFiltersVisible">
          <b-nav-item
            data-cy="Filters-basicTab"
            :active="complexFiltersSelectedTab === 'basic'"
            @click="complexFiltersSelectedTab = 'basic'"
            ><i class="fas fa-filter" />&nbsp;Advanced</b-nav-item
          >
          <b-nav-item
            data-cy="Filters-rawTab"
            :active="complexFiltersSelectedTab === 'raw'"
            @click="complexFiltersSelectedTab = 'raw'"
            ><i class="fas fa-scroll" />&nbsp;Raw JSON</b-nav-item
          >
          <b-nav-item
            data-cy="Filters-historyTab"
            :active="complexFiltersSelectedTab === 'history'"
            @click="complexFiltersSelectedTab = 'history'"
            ><i class="fas fa-history" />&nbsp;History</b-nav-item
          >
          <b-nav-item
            data-cy="Filters-favoriteTab"
            :active="complexFiltersSelectedTab === 'favorite'"
            @click="complexFiltersSelectedTab = 'favorite'"
            ><i class="fas fa-star" />&nbsp;Saved</b-nav-item
          >
          <div class="Filters-headerActions">
            <i
              v-if="!isFullscreen"
              class="Filters-headerBtn ml-3 fas fa-expand-arrows-alt"
              data-cy="Filters-fullscreen"
              title="Toggle fullscreen"
              @click="toggleFullscreen"
            />
            <i
              v-else
              class="Filters-headerBtn ml-3 fas fa-compress-arrows-alt"
              data-cy="Filters-fullscreen"
              title="Toggle fullscreen"
              @click="toggleFullscreen"
            />
            <i
              data-cy="Filters-close"
              class="Filters-headerBtn ml-3 fas fa-times-circle"
              @click="close"
            />
          </div>
        </template>
      </b-nav>
    </template>
    <template v-if="advancedFiltersVisible">
      <raw-filter
        v-if="complexFiltersSelectedTab === 'raw'"
        :action-buttons-visible="actionButtonsVisible"
        :current-filter="currentFilter"
        :sorting-enabled="sortingEnabled"
        @filter-submitted="onRawFilterSubmitted"
        @reset="onReset"
      />
      <basic-filter
        v-if="complexFiltersSelectedTab === 'basic'"
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
        @submit="onSubmitFromHistory"
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

<script>
import {
  NO_ACTIVE,
  ACTIVE_QUICK,
  ACTIVE_BASIC,
  ACTIVE_RAW,
  Filter,
} from '../../../services/filterManager';

import BasicFilter from './BasicFilter.vue';
import FavoriteFilters from './FavoriteFilters.vue';
import HistoryFilter from './HistoryFilter.vue';
import QuickFilter from './QuickFilter.vue';
import RawFilter from './RawFilter.vue';

export default {
  name: 'Filters',
  components: {
    QuickFilter,
    BasicFilter,
    RawFilter,
    HistoryFilter,
    FavoriteFilters,
  },
  props: {
    index: {
      type: String,
      required: true,
    },
    collection: {
      type: String,
      required: true,
    },
    actionButtonsVisible: {
      type: Boolean,
      required: false,
      default: true,
    },
    advancedQueryLabel: {
      type: String,
      required: false,
      default: 'Advanced query...',
    },
    availableOperands: {
      type: Object,
      required: true,
    },
    mappingAttributes: {
      type: Object,
      required: true,
    },
    currentFilter: Object,
    formatFromBasicSearch: Function,
    quickFilterEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    quickFilterPlaceholder: {
      type: String,
    },
    quickFilterSubmitOnType: {
      type: Boolean,
      default: true,
    },
    sortingEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    submitButtonLabel: {
      type: String,
      required: false,
      default: 'Search',
    },
    toggleAutoComplete: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      advancedFiltersVisible: false,
      complexFiltersSelectedTab: ACTIVE_BASIC,
      isFullscreen: false,
      jsonInvalid: false,
      objectTabActive: null,
      refreshace: false,
    };
  },
  computed: {
    complexFilterActive() {
      return (
        (this.currentFilter.active === ACTIVE_BASIC && this.currentFilter.basic !== null) ||
        (this.currentFilter.active === ACTIVE_RAW && this.currentFilter.raw !== null)
      );
    },
    quickFilter: {
      get() {
        if (!this.currentFilter) {
          return null;
        }

        return this.currentFilter.quick;
      },
    },
    basicFilter() {
      if (!this.currentFilter) {
        return null;
      }
      return this.currentFilter.basic;
    },
    rawFilter() {
      if (!this.currentFilter) {
        return null;
      }
      return this.currentFilter.raw;
    },
    sorting() {
      return this.currentFilter.sorting;
    },
  },
  methods: {
    setObjectTabActive(tab) {
      this.objectTabActive = tab;
      this.refreshace = !this.refreshace;
    },
    onQuickFilterUpdated(term) {
      this.onFiltersUpdated({
        ...this.currentFilter,
        quick: term,
      });
    },
    onQuickFilterSubmitted(term) {
      this.onSubmit({
        ...this.currentFilter,
        active: ACTIVE_QUICK,
        quick: term,
      });
    },
    onBasicFilterSubmitted(filter, sorting) {
      const newFilter = new Filter();
      newFilter.basic = filter;
      newFilter.active = filter ? ACTIVE_BASIC : NO_ACTIVE;
      newFilter.sorting = sorting;
      this.onSubmit(newFilter);
    },

    onRawFilterSubmitted(filter) {
      this.advancedFiltersVisible = false;
      this.onSubmit(
        Object.assign(this.currentFilter, {
          active: filter ? ACTIVE_RAW : NO_ACTIVE,
          raw: filter,
        }),
      );
    },
    onSubmitFromHistory(filter) {
      this.advancedFiltersVisible = false;
      this.onSubmit(Object.assign(this.currentFilter, filter), false);
    },
    onGenerateRawFilter(filter) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: filter ? ACTIVE_RAW : NO_ACTIVE,
          raw: filter,
        }),
      );
      this.complexFiltersSelectedTab = 'raw';
    },
    onRefresh() {
      this.submit(
        Object.assign(this.currentFilter, {
          from: 0,
        }),
      );
    },
    onReset() {
      this.onSubmit(new Filter());
    },
    onFiltersUpdated(newFilters) {
      this.$emit('filters-updated', newFilters);
    },
    onSubmit(filter, saveToHistory = true) {
      this.onFiltersUpdated(
        Object.assign(filter, {
          from: 0,
        }),
      );
      this.$emit('submit', saveToHistory);
      this.close();
    },
    onEnterPressed() {
      this.$emit('enter-pressed');
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
    },
    close() {
      this.advancedFiltersVisible = false;
      this.isFullscreen = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.Filters-headerActions {
  position: absolute;
  top: 17px;
  right: 17px;
}
.Filters-headerBtn {
  cursor: pointer;
  font-size: 20px;
  opacity: 0.5;

  &:hover {
    opacity: 0.9;
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
