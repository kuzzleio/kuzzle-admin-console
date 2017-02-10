<template>
  <div v-if="hasRights">
    <create-or-update
      headline="Create collection"
      @collection-create::create="create"
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
  import { canCreateCollection } from '../../../services/userAuthorization'
  import PageNotAllowed from '../../Common/PageNotAllowed'

  import CreateOrUpdate from './CreateOrUpdate'
  import {CREATE_COLLECTION, RESET_COLLECTION_DETAIL} from '../../../vuex/modules/collection/mutation-types'

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
    computed: {
      hasRights () {
        return canCreateCollection(this.index, this.collection)
      }
    },
    components: {
      CreateOrUpdate,
      PageNotAllowed
    },
    methods: {
      create () {
        this.error = ''

        this.$store.dispatch(CREATE_COLLECTION, {existingCollections: this.$store.state.index.indexesAndCollections[this.index], index: this.index})
          .then(() => {
            this.$router.push({name: 'DataIndexSummary', params: {index: this.index}})
          })
          .catch((e) => {
            this.error = e.message
          })
      }
    },
    mounted () {
      this.$store.commit(RESET_COLLECTION_DETAIL)
    }
  }
</script>