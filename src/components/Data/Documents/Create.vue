<template>
  <div class="wrapper" v-if="hasRights">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <create-or-update
      @document-create::create="create"
      @document-create::cancel="cancel"
      @document-create::reset-error="error = null"
      :error="error"
      :index="index"
      :collection="collection"
      v-model="document"
      @change-id="updateId"
      :get-mapping="getMappingDocument">
    </create-or-update>
  </div>
  <div v-else>
    <page-not-allowed></page-not-allowed>
  </div>
</template>


<script>
  import { canCreateDocument } from '../../../services/userAuthorization'
  import PageNotAllowed from '../../Common/PageNotAllowed'

  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'
  import kuzzle from '../../../services/kuzzle'
  import { getMappingDocument } from '../../../services/kuzzleWrapper'
  import CreateOrUpdate from './Common/CreateOrUpdate'
  import CollectionTabs from '../Collections/Tabs'
  import {FETCH_COLLECTION_DETAIL} from '../../../vuex/modules/collection/mutation-types'

  export default {
    name: 'DocumentCreateOrUpdate',
    components: {
      Headline,
      CollectionDropdown,
      CreateOrUpdate,
      CollectionTabs,
      PageNotAllowed
    },
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        error: '',
        document: {},
        id: null
      }
    },
    computed: {
      hasRights () {
        return canCreateDocument(this.index, this.collection)
      }
    },
    methods: {
      getMappingDocument,
      updateId (id) {
        this.id = id
      },
      create (document) {
        this.error = ''

        if (!document) {
          this.error = 'The document is invalid, please review it'
          return
        }

        let id = this.id

        if (document._id) {
          id = document._id
          delete document._id
        }

        return kuzzle
          .collection(this.collection, this.index)
          .createDocumentPromise(id, document, {refresh: 'wait_for'})
          .then(() => this.$store.dispatch(FETCH_COLLECTION_DETAIL, {index: this.index, collection: this.collection}))
          .then(() => {
            this.$router.push({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
          })
          .catch(err => {
            this.error = 'An error occurred while trying to create the document: <br/> ' + err.message
          })
      },
      cancel () {
        if (this.$router._prevTransition && this.$router._prevTransition.to) {
          this.$router.go(this.$router._prevTransition.to)
        } else {
          this.$router.push({name: 'DataDocumentsList', params: {index: this.index, collection: this.collection}})
        }
      }
    }
  }
</script>
