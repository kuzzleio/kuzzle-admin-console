<template>
  <ul class="list-group">
    <template v-if="filters.length > 0">
      <FilterHistoryItem
        v-for="(filter, i) in sortedHistory"
        :id="i"
        :key="i"
        :data-cy="'FilterHistoryItem--' + i"
        :index="index"
        :collection="collection"
        :filter="filter"
        :favorite="favorite"
        @filters-delete="onFiltersDelete"
        @toggle-favorite="toggleFavorite(filter, $event)"
        @change="onFilterChange"
        @submit="emit('submit', $event)"
      />
    </template>
    <template v-else>
      <h4 class="text-center text-title font-bold text-muted-foreground">
        You haven't performed any search yet.
      </h4>
      <p class="text-center text-muted-foreground">
        You'll find all your searches in this history.
      </p>
    </template>
  </ul>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import * as filterManager from '@/services/filterManager';
import type { SavedFilter } from './types';

import FilterHistoryItem from './FilterHistoryItem.vue';

const props = defineProps<{
  collection?: string;
  index?: string;
}>();

/*
 * `FilterHistoryItem` émettait `submit` sur son parent (`this.$parent.$emit`),
 * que `<script setup>` n'expose pas : il l'émet sur lui-même, et la liste le
 * relaie.
 */
const emit = defineEmits<{
  (e: 'submit', filter: SavedFilter): void;
}>();

const filters = ref<SavedFilter[]>([]);
const favorite = ref<SavedFilter[]>([]);

const sortedHistory = computed((): SavedFilter[] =>
  [...filters.value].sort((a, b) => (a.id < b.id ? 1 : -1)),
);

onMounted(() => {
  filters.value = filterManager.loadHistoyFromLocalStorage(props.index, props.collection);
  favorite.value = filterManager.loadFavoritesFromLocalStorage(props.index, props.collection);
});

function onFilterChange(): void {
  filterManager.saveHistoyToLocalStorage(filters.value, props.index, props.collection);
}

function onFiltersDelete(id: number): void {
  const idIndex = filters.value
    .map((filter) => {
      return filter.id;
    })
    .indexOf(id);
  filters.value.splice(idIndex, 1);
  filterManager.saveHistoyToLocalStorage(filters.value, props.index, props.collection);
}

function toggleFavorite(filter: SavedFilter, isFavorite: boolean): void {
  if (isFavorite) {
    favorite.value.push(filter);
  } else {
    favorite.value.splice(
      favorite.value.findIndex((e) => e.id === filter.id),
      1,
    );
  }
  filterManager.saveFavoritesToLocalStorage(favorite.value, props.index, props.collection);
}
</script>
