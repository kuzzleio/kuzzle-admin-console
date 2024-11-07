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
      />
    </template>
    <template v-else>
      <h4 class="text-secondary text-center">You don't have any favorite filters.</h4>
      <p class="text-secondary text-center">
        You can add more by browsing the history of your filters.
      </p>
    </template>
  </ul>
</template>

<script>
import * as filterManager from '@/services/filterManager';

import FavoriteFilterItem from './FavoriteFilterItem.vue';

export default {
  name: 'FavoriteFilters',
  components: {
    FavoriteFilterItem,
  },
  props: {
    index: String,
    collection: String,
  },
  data() {
    return {
      favorites: [],
    };
  },
  watch: {
    favorites: {
      handler() {
        filterManager.saveFavoritesToLocalStorage(this.favorites, this.index, this.collection);
      },
      deep: true,
    },
  },
  mounted() {
    this.favorites = filterManager.loadFavoritesFromLocalStorage(this.index, this.collection);
  },
  methods: {
    onFavoriteDelete(id) {
      const idIndex = this.favorites
        .map((favori) => {
          return favori.id;
        })
        .indexOf(id);
      this.favorites.splice(idIndex, 1);
    },
  },
};
</script>
