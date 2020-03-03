<template>
  <div class="DataLayout">
    <div class="DataLayout-sidebarWrapper">
      <treeview
        :route-name="$route.name"
        :index="$route.params.index"
        :collection="$route.params.collection"
      />
    </div>
    <div class="DataLayout-contentWrapper">
      <router-view v-if="routeExist" />
      <notFound v-else />
    </div>
  </div>
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
.DataLayout {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}
.DataLayout-sidebarWrapper {
  background-color: $light-grey-color;
  flex-basis: $sidebar-width;
  min-width: $sidebar-width;
  height: 100%;
  overflow: auto;
  box-shadow: 0px 0px 5px 0px rgba(112, 112, 112, 1);
  z-index: 1;
}

.DataLayout-contentWrapper {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: $content-gutter;
}
</style>
