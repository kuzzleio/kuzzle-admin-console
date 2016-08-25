<template>
  <div>
    <create-or-update
      :headline="Create collection"
      @collection-create::create="create"
      @collection-create::cancel="cancel"
      :index="index">
    </create-or-update>
  </div>
</template>

<script>
  import CreateOrUpdate from './CreateOrUpdate'
  import { fetchCollectionDetail, resetCollectionDetail, createCollection } from '../../../vuex/modules/collection/actions'
  import { getCollectionsFromIndex } from '../../../vuex/modules/data/actions'
  import { collections } from '../../../vuex/modules/data/getters'
  import { collectionName } from '../../../vuex/modules/collection/getters'

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
        resetCollectionDetail,
        getCollectionsFromIndex,
        createCollection
      },
      getters: {
        collections,
        collectionName
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
      create (name, mapping, isRealtime) {
        this.createCollection(this.index, name, mapping, isRealtime)
          .then(() => {
            this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch((e) => {
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
    },
    destroy () {
      this.resetCollectionDetail()
    }
  }
</script>