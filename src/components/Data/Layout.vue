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
  import {SET_TOAST} from '../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'DataLayout',
    components: {
      Treeview
    },
    mounted () {
      if (canSearchIndex()) {
        this.$store.dispatch(types.LIST_INDEXES_AND_COLLECTION)
          .catch(err => console.error(err))
      }
    },
    watch: {
      '$route' () {
        if (canSearchIndex()) {
          this.$store.dispatch(types.LIST_INDEXES_AND_COLLECTION)
            .catch(err => this.$store.commit(SET_TOAST, {text: err.message}))
        }
      }
    }
  }
</script>
