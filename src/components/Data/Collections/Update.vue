<template>
  <div>
    <create-or-update
      :headline="headline"
      @collection-create::create="update"
      @collection-create::reset-error="error = ''"
      :error="error"
      :index="index">
    </create-or-update>
  </div>
</template>

<script>
  import CreateOrUpdate from './CreateOrUpdate'
  import { FETCH_COLLECTION_DETAIL } from '../../../vuex/modules/collection/mutation-types'
  import kuzzle from '../../../services/kuzzle'

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
      CreateOrUpdate
    },
    computed: {
      headline () {
        return 'Update ' + this.$store.state.route.params.collection
      }
    },
    methods: {
      update (name, mapping, isRealtime) {
        this.error = ''

        if (isRealtime) {
          this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
          return
        }

        kuzzle
          .dataCollectionFactory(name, this.index)
          .dataMappingFactory(mapping || {})
          .applyPromise()
          .then(() => {
            this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch(e => {
            this.error = e.message
          })
      }
    },
    mounted () {
      this.$store.dispatch(FETCH_COLLECTION_DETAIL, {collections: this.$store.state.data.indexesAndCollections[this.index], index: this.index, collection: this.$store.state.route.params.collection})
        .catch(e => {
          this.$emit('toast', e.message, 'error')
          this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
        })
    }
  }
</script>