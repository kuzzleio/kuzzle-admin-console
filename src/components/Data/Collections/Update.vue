<template>
  <div>
    <create-or-update
      :headline="headline"
      @collection-create::create="update"
      @collection-create::cancel="cancel"
      :index="index">
    </create-or-update>
  </div>
</template>

<script>
  import CreateOrUpdate from './CreateOrUpdate'
  import { fetchCollectionDetail } from '../../../vuex/modules/collection/actions'
  import { getCollectionsFromIndex } from '../../../vuex/modules/data/actions'
  import { collections } from '../../../vuex/modules/data/getters'
  import { collectionName } from '../../../vuex/modules/collection/getters'
  import kuzzle from '../../../services/kuzzle'

  export default {
    name: 'Update',
    props: {
      index: String
    },
    components: {
      CreateOrUpdate
    },
    vuex: {
      actions: {
        fetchCollectionDetail,
        getCollectionsFromIndex
      },
      getters: {
        collections,
        collectionName
      }
    },
    computed: {
      headline () {
        return 'Update ' + this.collectionName
      }
    },
    ready () {
      this.getCollectionsFromIndex(this.index)
        .then(() => this.fetchCollectionDetail(this.collections, this.index, this.collectionName))
        .catch(e => {
          this.$dispatch('toast', e.message, 'error')
          this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
        })
    },
    methods: {
      update (name, mapping, isRealtime) {
        if (isRealtime) {
          this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
          return
        }

        console.log(name)
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
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
        }
      }
    }
  }
</script>