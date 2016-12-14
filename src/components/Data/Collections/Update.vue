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
  import { fetchCollectionDetail } from '../../../vuex/modules/collection/actions'
  import { indexesAndCollections } from '../../../vuex/modules/data/getters'
  import { collectionName } from '../../../vuex/modules/collection/getters'
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
    vuex: {
      actions: {
        fetchCollectionDetail
      },
      getters: {
        indexesAndCollections,
        collectionName
      }
    },
    computed: {
      headline () {
        return 'Update ' + this.collectionName
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
      this.fetchCollectionDetail(this.indexesAndCollections[this.index], this.index, this.collectionName)
        .catch(e => {
          this.$emit('toast', e.message, 'error')
          this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
        })
    }
  }
</script>