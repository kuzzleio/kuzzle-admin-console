<template>
  <div>
    <treeview
      :route-name="$route.name"
      :index="selectedIndex"
      :collection="selectedCollection"
      :tree="indexesAndCollections">
    </treeview>
    <section>
      <section class="view">
        <router-view
          :index="selectedIndex"
          :collection="selectedCollection">
        </router-view>
      </section>
    </section>
  </div>
</template>

<script>
  import {canSearchIndex} from '../../services/userAuthorization'
  import {listIndexesAndCollections} from '../../vuex/modules/data/actions'
  import {indexesAndCollections, selectedIndex, selectedCollection} from '../../vuex/modules/data/getters'
  import Treeview from './Browse/Treeview'

  export default {
    name: 'DataLayout',
    components: {
      Treeview
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
