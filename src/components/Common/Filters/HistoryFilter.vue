<template>
  <ul class="list-group">
    <HistoryFilterItem
      v-for="(filter, i) in filters"
      :key="i"
      :index="index"
      :collection="collection"
      :filter="filter"
      :favorite="favorite"
      @filters-delete="onFiltersDelete"
    />
  </ul>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import HistoryFilterItem from './HistoryFilterItem'

export default {
  name: 'HistoryFilter',
  components: {
    HistoryFilterItem
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
        filterManager.saveFavoriteToLocalStorage(
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
