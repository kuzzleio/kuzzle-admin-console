<template>
  <div v-if="hasRights">
    <create-or-update
      :headline="headline"
      @collection-create::create="update"
      @collection-create::reset-error="error = ''"
      :error="error"
      :index="index">
    </create-or-update>
  </div>
  <div v-else>
    <page-not-allowed></page-not-allowed>
  </div>
</template>

<script>
  import { canEditCollection } from '../../../services/userAuthorization'
  import PageNotAllowed from '../../Common/PageNotAllowed'

  import CreateOrUpdate from './CreateOrUpdate'
  import { FETCH_COLLECTION_DETAIL, UPDATE_COLLECTION } from '../../../vuex/modules/collection/mutation-types'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'
  import {LIST_INDEXES_AND_COLLECTION} from '../../../vuex/modules/index/mutation-types'

  export default {
    name: 'CollectionUpdate',
    props: {
      index: String
    },
    data () {
      return {
        error: ''
      }
    },
    components: {
      CreateOrUpdate,
      PageNotAllowed
    },
    computed: {
      headline () {
        return 'Update ' + this.$store.state.route.params.collection
      },
      hasRights () {
        return canEditCollection(this.index, this.collection)
      }
    },
    methods: {
      update () {
        this.error = ''

        return this.$store.dispatch(UPDATE_COLLECTION, {index: this.index})
          .then(() => {
            this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch(e => {
            this.error = e.message
          })
      }
    },
    mounted () {
      this.$store.dispatch(LIST_INDEXES_AND_COLLECTION)
        .then(() => this.$store.dispatch(FETCH_COLLECTION_DETAIL, {collections: this.$store.state.index.indexesAndCollections[this.index], index: this.index, collection: this.$store.state.route.params.collection}))
        .catch(e => {
          this.$store.commit(SET_TOAST, {text: e.message})
          this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
        })
    }
  }
</script>