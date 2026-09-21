<template>
  <Card
    class="Filters"
    :class="{ 'full-screen': isFullscreen && advancedFiltersVisible }"
    data-cy="Filters"
  >
    <!--
      `b-card` basculait son en-tête de `<div>` à `<nav>` selon l'état, et
      `b-nav card-header tabs` faisait passer une liste de liens pour des
      onglets. Ce sont de vrais onglets : `Tabs` les annonce comme tels
      (ADR-0017), et le bandeau reste un bandeau.
    -->
    <Tabs v-model="complexFiltersSelectedTab">
      <div class="tw:relative tw:border-b tw:border-border tw:px-4 tw:pt-3">
        <quick-filter
          v-if="!advancedFiltersVisible"
          class="tw:grow"
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
          <TabsList class="tw:border-b-0 tw:pr-24">
            <TabsTrigger data-cy="Filters-basicTab" value="basic">
              <i class="fas fa-filter" aria-hidden="true" />&nbsp;Advanced
            </TabsTrigger>
            <TabsTrigger data-cy="Filters-rawTab" value="raw">
              <i class="fas fa-scroll" aria-hidden="true" />&nbsp;Raw JSON
            </TabsTrigger>
            <TabsTrigger data-cy="Filters-historyTab" value="history">
              <i class="fas fa-history" aria-hidden="true" />&nbsp;History
            </TabsTrigger>
            <TabsTrigger data-cy="Filters-favoriteTab" value="favorite">
              <i class="fas fa-star" aria-hidden="true" />&nbsp;Saved
            </TabsTrigger>
          </TabsList>

          <!--
            Les deux icônes du bandeau étaient des `<i>` cliquables : ni
            atteignables au clavier, ni annoncées.
          -->
          <div class="tw:absolute tw:right-4 tw:top-3 tw:flex tw:items-center tw:gap-2">
            <Button
              :aria-label="isFullscreen ? 'Leave fullscreen' : 'Toggle fullscreen'"
              class="tw:text-muted-foreground"
              data-cy="Filters-fullscreen"
              size="icon"
              :title="isFullscreen ? 'Leave fullscreen' : 'Toggle fullscreen'"
              variant="ghost"
              @click="toggleFullscreen"
            >
              <i
                :class="isFullscreen ? 'fa-compress-arrows-alt' : 'fa-expand-arrows-alt'"
                aria-hidden="true"
                class="fas"
              />
            </Button>
            <Button
              aria-label="Close the filters"
              class="tw:text-muted-foreground"
              data-cy="Filters-close"
              size="icon"
              title="Close the filters"
              variant="ghost"
              @click="close"
            >
              <i class="fas fa-times-circle" aria-hidden="true" />
            </Button>
          </div>
        </template>
      </div>

      <template v-if="advancedFiltersVisible">
        <TabsContent class="tw:p-4" value="raw">
          <raw-filter
            :action-buttons-visible="actionButtonsVisible"
            :current-filter="currentFilter"
            :sorting-enabled="sortingEnabled"
            @filter-submitted="onRawFilterSubmitted"
            @reset="onReset"
          />
        </TabsContent>

        <TabsContent class="tw:p-4" value="basic">
          <basic-filter
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
        </TabsContent>

        <TabsContent class="tw:p-4" value="history">
          <history-filter :index="index" :collection="collection" @submit="onSubmitFromHistory" />
        </TabsContent>

        <TabsContent class="tw:p-4" value="favorite">
          <favorite-filters
            :index="index"
            :collection="collection"
            @filter-basic-submitted="onBasicFilterSubmitted"
            @filter-raw-submitted="onRawFilterSubmitted"
          />
        </TabsContent>
      </template>
    </Tabs>
  </Card>
</template>

<script>
import {
  NO_ACTIVE,
  ACTIVE_QUICK,
  ACTIVE_BASIC,
  ACTIVE_RAW,
  Filter,
} from '../../../services/filterManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import BasicFilter from './BasicFilter.vue';
import FavoriteFilters from './FavoriteFilters.vue';
import HistoryFilter from './HistoryFilter.vue';
import QuickFilter from './QuickFilter.vue';
import RawFilter from './RawFilter.vue';

export default {
  name: 'Filters',
  components: {
    BasicFilter,
    Button,
    Card,
    FavoriteFilters,
    HistoryFilter,
    QuickFilter,
    RawFilter,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
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
