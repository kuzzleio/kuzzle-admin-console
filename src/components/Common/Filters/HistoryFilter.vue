<template>
  <ul class="list-group">
    <template v-if="filters.length > 0">
      <FilterHistoryItem
        v-for="(filter, i) in sortedHistory"
        :key="i"
        :data-cy="'FilterHistoryItem--' + i"
        :index="index"
        :collection="collection"
        :filter="filter"
        :id="i"
        :favorite="favorite"
        @filters-delete="onFiltersDelete"
        @toggle-favorite="toggleFavorite(filter, $event)"
        @change="onFilterChange"
      />
    </template>
    <template v-else>
      <h4 class="text-secondary text-center">
        You haven't performed any search yet.
      </h4>
      <p class="text-secondary text-center">
        You'll find all your searches in this history.
      </p>
    </template>
  </ul>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import FilterHistoryItem from './FilterHistoryItem'

export default {
  name: 'FilterHistory',
  components: {
    FilterHistoryItem
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      filters: [],
      favorite: []
    }
  },
  computed: {
    sortedHistory() {
      return [...this.filters].sort((a, b) => (a.id < b.id ? 1 : -1))
    }
  },
  mounted() {
    this.filters = filterManager.loadHistoyFromLocalStorage(
      this.index,
      this.collection
    )
    this.favorite = filterManager.loadFavoritesFromLocalStorage(
      this.index,
      this.collection
    )
  },
  methods: {
    onFilterChange() {
      filterManager.saveHistoyToLocalStorage(
        this.filters,
        this.index,
        this.collection
      )
    },
    onFiltersDelete(id) {
      const idIndex = this.filters
        .map(filter => {
          return filter.id
        })
        .indexOf(id)
      this.filters.splice(idIndex, 1)
      filterManager.saveHistoyToLocalStorage(
        this.filters,
        this.index,
        this.collection
      )
    },
    toggleFavorite(filter, favorite) {
      if (favorite) {
        this.favorite.push(filter)
      } else {
        this.favorite.splice(
          this.favorite.findIndex(e => e.id === filter.id),
          1
        )
      }
      filterManager.saveFavoritesToLocalStorage(
        this.favorite,
        this.index,
        this.collection
      )
    }
  }
}
</script>
