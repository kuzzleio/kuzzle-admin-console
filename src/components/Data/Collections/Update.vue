<template>
  <div>
    <create-or-update
      :headline="headline"
      @collection-create::create="update"
      :index="index">
    </create-or-update>
  </div>
</template>

<script>
  import CreateOrUpdate from './CreateOrUpdate'
  import { fetchCollectionDetail } from '../../../vuex/modules/collection/actions'
  import { listIndexesAndCollections } from '../../../vuex/modules/data/actions'
  import { indexesAndCollections } from '../../../vuex/modules/data/getters'
  import { collectionName } from '../../../vuex/modules/collection/getters'
  import kuzzle from '../../../services/kuzzle'

  export default {
    name: 'CollectionUpdate',
    props: {
      index: String
    },
    components: {
      CreateOrUpdate
    },
    vuex: {
      actions: {
        fetchCollectionDetail,
        listIndexesAndCollections
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
        if (isRealtime) {
          this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
          return
        }

        kuzzle
          .dataCollectionFactory(name, this.index)
          .dataMappingFactory(mapping || {})
          .applyPromise()
          .then(() => {
            this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch(e => {
            this.$dispatch('toast', e.message, 'error')
          })
      }
    },
    ready () {
      this.fetchCollectionDetail(this.indexesAndCollections[this.index], this.index, this.collectionName)
        .catch(e => {
          this.$dispatch('toast', e.message, 'error')
          this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
        })
    }
  }
</script>