<template>
  <ul class="list-group">
    <FavoriteFilterItem
      v-for="(favori, i) in favorites"
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
      favorites: []
    }
  },
  mounted() {
    this.favorites = filterManager.loadFavoritesFromLocalStorage(
      this.index,
      this.collection
    )
  },
  methods: {
    onFavoriteDelete(id) {
      let idIndex = this.favorites
        .map(favori => {
          return favori.id
        })
        .indexOf(id)
      this.favorites.splice(idIndex, 1)
    }
  },
  watch: {
    favorites: {
      handler() {
        filterManager.saveFavoritesToLocalStorage(this.favorites, this.index, this.collection)
      },
      deep: true
    }
  }
}
</script>
