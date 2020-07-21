<template>
  <ul class="list-group">
    <FavoriteFilterItem
      v-for="(favori, i) in favoris"
      :key="i"
      :index="index"
      :collection="collection"
      :favori="favori"
      @favoris-delete="onFavoriteDelete"
    />
  </ul>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import FavoriteFilterItem from './FavoriteFilterItem'

export default {
  name: 'FavoriteFilters',
  components: {
    FavoriteFilterItem
  },
  props: {
    index: String,
    collection: String
  },
  data() {
    return {
      favoris: []
    }
  },
  mounted() {
    this.favoris = filterManager.loadFavoritesFromLocalStorage(
      this.index,
      this.collection
    )
  },
  methods: {
    onFavoriteDelete(id) {
      let idIndex = this.favoris
        .map(favori => {
          return favori.id
        })
        .indexOf(id)
      this.favoris.splice(idIndex, 1)
    }
  },
  watch: {
    favoris: {
      handler() {
        filterManager.saveFavoriteToLocalStorage(this.favoris, this.index, this.collection)
      },
      deep: true
    }
  }
}
</script>
