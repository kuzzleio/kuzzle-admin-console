<template>
  <ul class="list-group">
    <template v-if="filters.length > 0">
      <FilterHistoryItem
        v-for="(filter, i) in filters"
        :key="i"
        :index="index"
        :collection="collection"
        :filter="filter"
        :favorite="favorite"
        @filters-delete="onFiltersDelete"
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
    onFiltersDelete(id) {
      let idIndex = this.filters
        .map(filter => {
          return filter.id
        })
        .indexOf(id)
      this.filters.splice(idIndex, 1)
    }
  },
  watch: {
    filters: {
      handler() {
        filterManager.saveHistoyToLocalStorage(
          this.filters,
          this.index,
          this.collection
        )
      },
      deep: true
    },
    favorite: {
      handler() {
        filterManager.saveFavoritesToLocalStorage(
          this.favorite,
          this.index,
          this.collection
        )
      },
      deep: true
    }
  }
}
</script>
