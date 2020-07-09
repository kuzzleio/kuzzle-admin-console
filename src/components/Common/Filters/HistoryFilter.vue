<template>
  <ul class="list-group">
    <HistoryFilterIteam
      v-for="(filter, i) in filters"
      :key="i"
      :index="index"
      :collection="collection"
      :filter="filter"
      :favoris="favoris"
      @filters-delete="onFiltersDelete"
    />
  </ul>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import HistoryFilterIteam from './HistoryFilterIteam'

export default {
  name: 'HistoryFilter',
  components: {
    HistoryFilterIteam
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      filters: [],
      favoris: []
    }
  },
  mounted() {
    this.filters = filterManager.LoadHistoyFromLocalStorage(
      this.index,
      this.collection
    )
    this.favoris = filterManager.LoadFavorisFromLocalStorage(
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
        filterManager.SaveHistoyToLocalStorage(
          this.filters,
          this.index,
          this.collection
        )
      },
      deep: true
    },
    favoris: {
      handler() {
        filterManager.SaveFavorisToLocalStorage(
          this.favoris,
          this.index,
          this.collection
        )
      },
      deep: true
    }
  }
}
</script>
