<template>
  <treeview
    :route-name="$route.name"
    :index="selectedIndex"
    :collection="selectedCollection"
    :tree="indexesAndCollections">
  </treeview>
  <section class="breadcrumb-view">
    <breadcrumb
      :route-name="$route.name"
      :index="selectedIndex"
      :collection="selectedCollection"
      :tree="indexesAndCollections">
    </breadcrumb>

    <section class="view">
      <router-view
        :index="selectedIndex"
        :collection="selectedCollection">
      </router-view>
    </section>
  </section>
</template>

<style lang="scss" scoped>
  .breadcrumb-view {
    margin-top: 50px;
  }
  section > section {
    margin-top: 50px;
  }
</style>

<script>
  import {canSearchIndex} from '../../services/userAuthorization'
  import {listIndexesAndCollections} from '../../vuex/modules/data/actions'
  import {indexesAndCollections, selectedIndex, selectedCollection} from '../../vuex/modules/data/getters'
  import Treeview from './Browse/Treeview'
  import Breadcrumb from './Breadcrumb'

  export default {
    name: 'DataLayout',
    components: {
      Treeview,
      Breadcrumb
    },
    methods: {
      canSearchIndex
    },
    ready () {
      if (this.canSearchIndex()) {
        this.listIndexesAndCollections()
      }
    },
    vuex: {
      actions: {
        listIndexesAndCollections
      },
      getters: {
        selectedIndex,
        selectedCollection,
        indexesAndCollections
      }
    }
  }
</script>
