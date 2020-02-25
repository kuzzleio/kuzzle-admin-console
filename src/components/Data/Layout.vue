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
  mounted() {
    this.$store.direct.dispatch.index.listIndexesAndCollections()
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
