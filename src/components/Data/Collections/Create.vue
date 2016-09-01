<template>
  <div>
    <create-or-update
      headline="Create collection"
      @collection-create::create="create"
      :index="index">
    </create-or-update>
  </div>
</template>

<script>
  import CreateOrUpdate from './CreateOrUpdate'
  import { createCollection } from '../../../vuex/modules/collection/actions'
  import { collectionName } from '../../../vuex/modules/collection/getters'
  import { indexesAndCollections } from '../../../vuex/modules/data/getters'

  export default {
    name: 'CollectionCreate',
    props: {
      index: String
    },
    components: {
      CreateOrUpdate
    },
    vuex: {
      actions: {
        createCollection
      },
      getters: {
        collectionName,
        indexesAndCollections
      }
    },
    methods: {
      create (name, mapping, isRealtime) {
        this.createCollection(this.indexesAndCollections[this.index], this.index, name, mapping, isRealtime)
          .then(() => {
            this.$router.go({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      }
    }
  }
</script>