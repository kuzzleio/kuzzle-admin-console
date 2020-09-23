<template>
  <Multipane class="DataLayout Custom-resizer" layout="vertical">
    <div class="DataLayout-sidebarWrapper" data-cy="DataLayout-sidebarWrapper">
      <treeview
        :indexName="$route.params.index"
        :collectionName="$route.params.collection"
      />
    </div>
    <MultipaneResizer data-cy="sidebarResizer" />
    <div class="DataLayout-contentWrapper">
      <template v-if="loading">
        <main-spinner></main-spinner>
      </template>
      <router-view v-else />
    </div>
  </Multipane>
</template>

<script>
import MainSpinner from '../Common/MainSpinner'
import { Multipane, MultipaneResizer } from 'vue-multipane'

export default {
  name: 'DataLayout',
  components: {
    MainSpinner,
    // Treeview,
    Multipane,
    MultipaneResizer
  },
  computed: {
    loading() {
      return this.$store.direct.state.index.loadingIndexes
    }
  },
  methods: {
    async loadIndexes() {
      await this.$store.direct.dispatch.index.listIndexes()
    }
  },
  mounted() {
    this.loadIndexes()
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
  z-index: 1;
}

.DataLayout-contentWrapper {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
  padding: $content-gutter;
}

.Custom-resizer > .multipane-resizer {
  margin: 0;
  left: 0;
  position: relative;
  padding: 3px;
  border: 1px solid #ccc;
  box-shadow: 2px 0px 5px -2px rgba(112, 112, 112, 1);
  &:before {
    display: block;
    content: '';
    width: 1px;
    height: 50px;
    position: absolute;
    top: 45%;
    left: 50%;
    border-left: 1px solid #aaa;
  }
  &:hover {
    &:before {
      border-color: #777;
      background-color: #f5f5f5;
    }
  }
}
</style>
