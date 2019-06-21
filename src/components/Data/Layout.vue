<template>
  <div id="data-layout">
    <treeview
      :route-name="$route.name"
      :index="$route.params.index"
      :collection="$route.params.collection"
    />
    <section>
      <section class="view">
        <router-view
          v-if="routeExist"
          :index="$route.params.index"
          :collection="$route.params.collection"
        />
        <notFound v-else />
      </section>
    </section>
  </div>
</template>

<script>
import { canSearchIndex } from '../../services/userAuthorization'
import { LIST_INDEXES_AND_COLLECTION } from '../../vuex/modules/index/mutation-types'
import { FETCH_COLLECTION_DETAIL } from '../../vuex/modules/collection/mutation-types'
import Treeview from './Leftnav/Treeview'
import NotFound from '../404'
// import { SET_TOAST } from '../../vuex/modules/common/toaster/mutation-types'

export default {
  name: 'DataLayout',
  components: {
    Treeview,
    NotFound
  },
  data() {
    return {
      routeExist: true
    }
  },
  mounted() {
    if (canSearchIndex()) {
      this.$store.dispatch(LIST_INDEXES_AND_COLLECTION)
      this.setRouteExist()
      
      this.$store.dispatch(FETCH_COLLECTION_DETAIL, {
        index: this.$route.params.index,
        collection: this.$route.params.collection
      })
    }
  },
  methods: {
    setRouteExist() {
      this.routeExist = true
      const { index, collection } = this.$route.params
      if (
        typeof index !== 'undefined' &&
        this.$store.state.index.indexes.indexOf(index) === -1
      ) {
        this.routeExist = false
      } else {
        if (
          typeof collection !== 'undefined' &&
          this.$store.getters
            .indexCollections(index)
            .stored.indexOf(collection) === -1 &&
          this.$store.getters
            .indexCollections(index)
            .realtime.indexOf(collection) === -1
        ) {
          this.routeExist = false
        }
      }
    }
  }
}
</script>
