<template>
  <div>
    <treeview
      :route-name="$route.name"
      :index="$store.state.route.params.index"
      :collection="$store.state.route.params.collection">
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
  import {LIST_INDEXES_AND_COLLECTION} from '../../vuex/modules/index/mutation-types'
  import {FETCH_COLLECTION_DETAIL} from '../../vuex/modules/collection/mutation-types'
  import Treeview from './Leftnav/Treeview'
  import {SET_TOAST} from '../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'DataLayout',
    components: {
      Treeview
    },
    mounted () {
      if (canSearchIndex()) {
        this.$store.dispatch(LIST_INDEXES_AND_COLLECTION)
          .then(() => {
            return this.$store.dispatch(FETCH_COLLECTION_DETAIL,
              {
                index: this.$store.state.route.params.index,
                collection: this.$store.state.route.params.collection
              })
          })
          .catch(err => console.error(err))
      }
    },
    watch: {
      '$route' () {
        if (canSearchIndex()) {
          this.$store.dispatch(LIST_INDEXES_AND_COLLECTION)
            .then(() => {
              return this.$store.dispatch(FETCH_COLLECTION_DETAIL, {
                index: this.$store.state.route.params.index,
                collection: this.$store.state.route.params.collection
              })
            })
            .catch(err => this.$store.commit(SET_TOAST, {text: err.message}))
        }
      }
    }
  }
</script>
