<template>
  <div>
    <create-or-update
      headline="Create collection"
      @collection-create::create="create"
      @collection-create::reset-error="error = ''"
      :error="error"
      :index="index">
    </create-or-update>
  </div>
</template>

<script>
  import CreateOrUpdate from './CreateOrUpdate'
  import { createCollection } from '../../../vuex/modules/collection/actions'
  import { collectionName } from '../../../vuex/modules/collection/getters'
  import { indexesAndCollections } from '../../../vuex/modules/data/getters'
  import {CREATE_COLLECTION} from '../../../vuex/modules/collection/mutation-types'

  export default {
    name: 'CollectionCreate',
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
        createCollection
      },
      getters: {
        collectionName,
        indexesAndCollections
      }
    },
    methods: {
      create (name, mapping, isRealtime) {
        this.error = ''

        this.$store.dispatch(CREATE_COLLECTION, {existingCollections: this.$store.state.data.indexesAndCollections[this.index], index: this.index, collectionName: name, mapping, isRealtime})
          .then(() => {
            this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch((e) => {
            this.error = e.message
          })
      }
    }
  }
</script>