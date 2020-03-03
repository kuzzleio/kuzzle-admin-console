<template>
  <div class="DataLayout">
    <div class="DataLayout-sidebarWrapper">
      <!-- TODO loader here -->
      <treeview
        :index="$route.params.index"
        :collection="$route.params.collection"
      />
    </div>
    <div class="DataLayout-contentWrapper">
      <router-view />
    </div>
  </div>
</template>

<script>
import Treeview from './Leftnav/Treeview'

export default {
  name: 'DataLayout',
  components: {
    Treeview
  },
  computed: {
    loading() {
      return this.$store.direct.state.index.loading
    }
  },
  methods: {
    async loadStuff() {
      if (this.loading) {
        return
      }
      await this.$store.direct.dispatch.index.listIndexesAndCollections()
    }
  },
  mounted() {
    this.loadStuff()
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
