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
import { SET_TOAST } from '../../vuex/modules/common/toaster/mutation-types'

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
  watch: {
    $route() {
      if (canSearchIndex()) {
        try {
          this.setRouteExist()
          return this.$store.dispatch(FETCH_COLLECTION_DETAIL, {
            index: this.$route.params.index,
            collection: this.$route.params.collection
          })
        } catch (err) {
          this.$store.commit(SET_TOAST, { text: err.message })
        }
      }
    }
  },
  mounted() {
    this.$store.watch((state) => state.index.indexes, (n) => {
      if (n.includes(this.$route.params.index) && !this.$route.params.collection) {
        this.routeExist = true
      }
    })
    this.$store.watch((_, getters) => getters.indexCollections(this.$route.params.index), (n) => {
      if (n.stored.includes(this.$route.params.collection)) {
        this.routeExist = true
      } else if (n.realtime.includes(this.$route.params.collection)) {
        this.routeExist = true
      }
    })
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
