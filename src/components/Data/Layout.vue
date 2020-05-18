<template>
  <Multipane class="DataLayout">
    <div class="DataLayout-sidebarWrapper">
      <treeview
        :index="$route.params.index"
        :collection="$route.params.collection"
      />
    </div>
    <MultipaneResizer></MultipaneResizer>
    <div class="DataLayout-contentWrapper">
      <template v-if="loading">
        <main-spinner></main-spinner>
      </template>
      <router-view v-else />
    </div>
  </Multipane>
</template>

<script>
import Treeview from './Leftnav/Treeview'
import MainSpinner from '../Common/MainSpinner'
import { Multipane, MultipaneResizer } from 'vue-multipane'

export default {
  name: 'DataLayout',
  components: {
    MainSpinner,
    Treeview,
    Multipane,
    MultipaneResizer
  },
  computed: {
    loading() {
      return this.$store.direct.state.index.loadingIndexes
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
  min-width: $sidebar-width;
  width: $sidebar-width;
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
