<template>
  <!--
    `gap-0 py-0` : `Card` pose `py-6`, qui laissait une bande vide sous la
    recherche rapide ; le bandeau et les onglets portent leur propre marge
    (E-24 de la comparaison v4 / v5).
  -->
  <Card
    class="Filters gap-0 py-0"
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
      <div
        class="relative px-4 pt-3"
        :class="advancedFiltersVisible ? 'border-b border-border' : 'pb-3'"
      >
        <quick-filter
          v-if="!advancedFiltersVisible"
          class="grow"
          submit-button-label="Quick Search"
          :action-buttons-visible="actionButtonsVisible"
          :advanced-filters-visible="advancedFiltersVisible"
          :advanced-query-label="advancedQueryLabel"
          :complex-filter-active="complexFilterActive"
          :placeholder="quickFilterPlaceholder"
          :submit-on-type="quickFilterSubmitOnType"
          :value="quickFilter"
          @display-advanced-filters="advancedFiltersVisible = !advancedFiltersVisible"
          @input="onQuickFilterUpdated"
          @reset="handleReset"
          @submit="onQuickFilterSubmitted"
        />

        <!--
          Les onglets et les deux boutons partagent une ligne `flex` ; la
          barre défile plutôt que de passer à la ligne. Les boutons étaient
          posés en absolu par-dessus une réserve de `pr-24` : sous 400 px, les
          libellés se coupaient et « History » passait sous eux.
        -->
        <div v-if="advancedFiltersVisible" class="flex items-center gap-2">
          <TabsList class="min-w-0 flex-1 overflow-x-auto overflow-y-hidden border-b-0 pb-px">
            <TabsTrigger
              class="shrink-0 whitespace-nowrap"
              data-cy="Filters-basicTab"
              value="basic"
            >
              <i class="fas fa-filter" aria-hidden="true" />&nbsp;Advanced
            </TabsTrigger>
            <TabsTrigger class="shrink-0 whitespace-nowrap" data-cy="Filters-rawTab" value="raw">
              <i class="fas fa-scroll" aria-hidden="true" />&nbsp;Raw JSON
            </TabsTrigger>
            <TabsTrigger
              class="shrink-0 whitespace-nowrap"
              data-cy="Filters-historyTab"
              value="history"
            >
              <i class="fas fa-history" aria-hidden="true" />&nbsp;History
            </TabsTrigger>
            <TabsTrigger
              class="shrink-0 whitespace-nowrap"
              data-cy="Filters-favoriteTab"
              value="favorite"
            >
              <i class="fas fa-star" aria-hidden="true" />&nbsp;Saved
            </TabsTrigger>
          </TabsList>

          <!--
            Les deux icônes du bandeau étaient des `<i>` cliquables : ni
            atteignables au clavier, ni annoncées.
          -->
          <div class="flex shrink-0 items-center gap-2">
            <Button
              :aria-label="isFullscreen ? 'Leave fullscreen' : 'Toggle fullscreen'"
              class="text-muted-foreground"
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
              class="text-muted-foreground"
              data-cy="Filters-close"
              size="icon"
              title="Close the filters"
              variant="ghost"
              @click="close"
            >
              <i class="fas fa-times-circle" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <template v-if="advancedFiltersVisible">
        <TabsContent class="p-4" value="raw">
          <raw-filter
            :action-buttons-visible="actionButtonsVisible"
            :current-filter="currentFilter"
            @filter-submitted="onRawFilterSubmitted"
            @reset="handleReset"
          />
        </TabsContent>

        <TabsContent class="p-4" value="basic">
          <basic-filter
            :action-buttons-visible="actionButtonsVisible"
            :available-operands="availableOperands"
            :basic-filter="basicFilter"
            :mapping-attributes="mappingAttributes"
            :sorting="sorting"
            :sorting-enabled="sortingEnabled"
            @filter-submitted="onBasicFilterSubmitted"
            @generate-raw-filter="onGenerateRawFilter"
          />
        </TabsContent>

        <TabsContent class="p-4" value="history">
          <history-filter :index="index" :collection="collection" @submit="onSubmitFromHistory" />
        </TabsContent>

        <TabsContent class="p-4" value="favorite">
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

<script setup lang="ts">
import { computed, ref } from 'vue';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ACTIVE_BASIC,
  ACTIVE_QUICK,
  ACTIVE_RAW,
  Filter,
  NO_ACTIVE,
} from '@/services/filterManager';
import type { MappingAttributes } from '@/services/mappingHelpers';
import type { BasicFilterGroups, FilterSorting, SavedFilter, SearchFilter } from './types';

import BasicFilter from './BasicFilter.vue';
import FavoriteFilters from './FavoriteFilters.vue';
import HistoryFilter from './HistoryFilter.vue';
import QuickFilter from './QuickFilter.vue';
import RawFilter from './RawFilter.vue';

const props = withDefaults(
  defineProps<{
    actionButtonsVisible?: boolean;
    advancedQueryLabel?: string;
    availableOperands: Record<string, string>;
    collection?: string;
    currentFilter: SearchFilter;
    index?: string;
    mappingAttributes: MappingAttributes;
    quickFilterPlaceholder?: string;
    quickFilterSubmitOnType?: boolean;
    sortingEnabled?: boolean;
  }>(),
  {
    actionButtonsVisible: true,
    advancedQueryLabel: 'Advanced query...',
    collection: undefined,
    index: undefined,
    quickFilterPlaceholder: undefined,
    quickFilterSubmitOnType: true,
    sortingEnabled: true,
  },
);

const emit = defineEmits<{
  (e: 'filters-updated', filter: SearchFilter): void;
  (e: 'submit', saveToHistory: boolean): void;
}>();

const advancedFiltersVisible = ref(false);
const complexFiltersSelectedTab = ref<string | number>(ACTIVE_BASIC);
const isFullscreen = ref(false);

const complexFilterActive = computed(
  (): boolean =>
    (props.currentFilter.active === ACTIVE_BASIC && props.currentFilter.basic !== null) ||
    (props.currentFilter.active === ACTIVE_RAW && props.currentFilter.raw !== null),
);

const quickFilter = computed((): string | undefined => props.currentFilter?.quick);

const basicFilter = computed(
  (): BasicFilterGroups | null | undefined => props.currentFilter?.basic,
);

const sorting = computed((): FilterSorting | null | undefined => props.currentFilter.sorting);

function onQuickFilterUpdated(term: string | number): void {
  handleFiltersUpdated({
    ...props.currentFilter,
    quick: String(term),
  });
}

function onQuickFilterSubmitted(term: string | number | undefined): void {
  handleSubmit({
    ...props.currentFilter,
    active: ACTIVE_QUICK,
    quick: term === undefined ? undefined : String(term),
  });
}

function onBasicFilterSubmitted(
  filter: BasicFilterGroups | null | undefined,
  sorting?: FilterSorting | null,
): void {
  const newFilter: SearchFilter = new Filter();
  newFilter.basic = filter;
  newFilter.active = filter ? ACTIVE_BASIC : NO_ACTIVE;
  newFilter.sorting = sorting;
  handleSubmit(newFilter);
}

function onRawFilterSubmitted(filter: Record<string, unknown> | null | undefined): void {
  advancedFiltersVisible.value = false;
  handleSubmit(
    Object.assign(props.currentFilter, {
      active: filter ? ACTIVE_RAW : NO_ACTIVE,
      raw: filter,
    }),
  );
}

function onSubmitFromHistory(filter: SavedFilter): void {
  advancedFiltersVisible.value = false;
  handleSubmit(Object.assign(props.currentFilter, filter), false);
}

function onGenerateRawFilter(filter: object): void {
  handleFiltersUpdated(
    Object.assign(props.currentFilter, {
      active: filter ? ACTIVE_RAW : NO_ACTIVE,
      raw: filter,
    }),
  );
  complexFiltersSelectedTab.value = 'raw';
}

function handleReset(): void {
  handleSubmit(new Filter());
}

function handleFiltersUpdated(newFilters: SearchFilter): void {
  emit('filters-updated', newFilters);
}

function handleSubmit(filter: SearchFilter, saveToHistory = true): void {
  handleFiltersUpdated(
    Object.assign(filter, {
      from: 0,
    }),
  );
  emit('submit', saveToHistory);
  close();
}

function toggleFullscreen(): void {
  isFullscreen.value = !isFullscreen.value;
}

function close(): void {
  advancedFiltersVisible.value = false;
  isFullscreen.value = false;
}
</script>
