<template>
  <ul class="list-group">
    <FavoriFilterIteam
      v-for="(favori, i) in favoris"
      :key="i"
      :index="index"
      :collection="collection"
      :favori="favori"
      @favoris-delete="onFavoriDelete"
    />
  </ul>
</template>

<script>
import * as filterManager from '../../../services/filterManager'
import FavoriFilterIteam from './FavoriFilterIteam'

export default {
  name: 'FavorisFilter',
  components: {
    FavoriFilterIteam
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
    this.favoris = filterManager.LoadFavorisLocalStorage(
      this.index,
      this.collection
    )
  },
  methods: {
    onFavoriDelete(id) {
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
        filterManager.SaveFavorisLocalStorage(this.favoris, this.index, this.collection)
      },
      deep: true
    }
  }
}
</script>
