<template>
  <ul class="list-group">
    <template v-if="favorites.length > 0">
      <FavoriteFilterItem
        v-for="(favori, i) in favorites"
        :id="i"
        :key="i"
        :data-cy="'FilterFavoriItem--' + i"
        :index="index"
        :collection="collection"
        :favorite="favori"
        @favoris-delete="onFavoriteDelete"
        @filter-basic-submitted="
          (filter, sorting) => emit('filter-basic-submitted', filter, sorting)
        "
        @filter-raw-submitted="emit('filter-raw-submitted', $event)"
      />
    </template>
    <template v-else>
      <h4 class="text-center text-title font-bold text-muted-foreground">
        You don't have any favorite filters.
      </h4>
      <p class="text-center text-muted-foreground">
        You can add more by browsing the history of your filters.
      </p>
    </template>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import * as filterManager from '@/services/filterManager';
import type { BasicFilterGroups, FilterSorting, SavedFilter } from './types';

import FavoriteFilterItem from './FavoriteFilterItem.vue';

const props = defineProps<{
  collection?: string;
  index?: string;
}>();

/*
 * `FavoriteFilterItem` émettait ces deux événements sur son parent
 * (`this.$parent.$emit`), que `<script setup>` n'expose pas : il les émet sur
 * lui-même, et la liste les relaie.
 */
const emit = defineEmits<{
  (
    e: 'filter-basic-submitted',
    filter: BasicFilterGroups | null | undefined,
    sorting: FilterSorting | null | undefined,
  ): void;
  (e: 'filter-raw-submitted', filter: Record<string, unknown> | null | undefined): void;
}>();

const favorites = ref<SavedFilter[]>([]);

watch(
  favorites,
  () => {
    filterManager.saveFavoritesToLocalStorage(favorites.value, props.index, props.collection);
  },
  { deep: true },
);

onMounted(() => {
  favorites.value = filterManager.loadFavoritesFromLocalStorage(props.index, props.collection);
});

function onFavoriteDelete(id: number): void {
  const idIndex = favorites.value
    .map((favori) => {
      return favori.id;
    })
    .indexOf(id);
  favorites.value.splice(idIndex, 1);
}
</script>
