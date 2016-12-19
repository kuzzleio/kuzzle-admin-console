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
  import * as types from '../../vuex/modules/data/mutation-types'
  import {selectedIndex, selectedCollection} from '../../vuex/modules/data/getters'
  import Treeview from './Leftnav/Treeview'

  export default {
    name: 'DataLayout',
    components: {
      Treeview
    },
    mounted () {
      if (canSearchIndex()) {
        this.$store.dispatch(types.LIST_INDEXES_AND_COLLECTION)
      }
    },
    vuex: {
      getters: {
        selectedIndex,
        selectedCollection
      }
    },
    watch: {
      'selectedIndex': function () {
        if (canSearchIndex()) {
          this.$store.dispatch(types.LIST_INDEXES_AND_COLLECTION)
        }
      }
    }
  }
</script>
