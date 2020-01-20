<template>
  <b-container fluid class="p-0 h-100">
    <b-row no-gutters class="h-100">
      <div class="sidebar">
        <treeview
          :route-name="$route.name"
          :index="$route.params.index"
          :collection="$route.params.collection"
        />
      </div>
      <div class="content">
        <router-view
          v-if="routeExist"
          :index="$route.params.index"
          :collection="$route.params.collection"
        />
        <notFound v-else />
      </div>
    </b-row>
  </b-container>
</template>

<script>
import { canSearchIndex } from '../../services/userAuthorization'
import Treeview from './Leftnav/Treeview'
import NotFound from './Data404'

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
          return this.$store.direct.dispatch.collection.fetchCollectionDetail({
            index: this.$route.params.index,
            collection: this.$route.params.collection
          })
        } catch (err) {
          this.$store.direct.commit.toaster.setToast({ text: err.message })
        }
      }
    },
    '$store.direct.getters.index.indexCollections'(n) {
      if (n.stored.includes(this.$route.params.collection)) {
        this.routeExist = true
      } else if (n.realtime.includes(this.$route.params.collection)) {
        this.routeExist = true
      }
    }
  },
  mounted() {
    this.$store.watch(
      state => state.index.indexes,
      n => {
        if (
          n.includes(this.$route.params.index) &&
          !this.$route.params.collection
        ) {
          this.routeExist = true
        }
      }
    )
    if (canSearchIndex()) {
      this.$store.direct.dispatch.index.listIndexesAndCollections()
      this.setRouteExist()

      this.$store.direct.dispatch.collection.fetchCollectionDetail({
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
        this.$store.direct.state.index.indexes.indexOf(index) === -1
      ) {
        this.routeExist = false
      } else {
        if (
          typeof collection !== 'undefined' &&
          this.$store.direct.getters.index
            .indexCollections(index)
            .stored.indexOf(collection) === -1 &&
          this.$store.direct.getters.index
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

<style lang="scss" scoped>
.sidebar {
  width: $sidebar-width;
  position: fixed;
  top: 0;
  padding-top: $navbar-height;
  overflow-y: auto;
  height: 100%;
}

.content {
  width: calc(100% - #{$sidebar-width});
  padding-left: $sidebar-width;
}
</style>
