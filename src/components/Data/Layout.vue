<template>
  <div>
    <treeview
      :route-name="$route.name"
      :index="$store.state.route.params.index"
      :collection="$store.state.route.params.collection"
      :tree="indexesAndCollections">
    </treeview>
    <section>
      <section class="view">
        <router-view
          :index="$store.state.route.params.index"
          :collection="$store.state.route.params.collection">
        </router-view>
      </section>
    </section>
  </div>
</template>

<script>
  import {canSearchIndex} from '../../services/userAuthorization'
  import * as types from '../../vuex/modules/data/mutation-types'
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
    watch: {
      '$route' () {
        if (canSearchIndex()) {
          this.$store.dispatch(types.LIST_INDEXES_AND_COLLECTION)
        }
      }
    }
  }
</script>
