<template>
  <div v-if="hasRights" class="wrapper">
    <headline>
      {{ collection }}
      <collection-dropdown
        class="icon-medium icon-black"
        :index="index"
        :collection="collection"
      />
    </headline>

    <collection-tabs />

    <create-or-update
      v-model="document"
      :error="error"
      :index="index"
      :collection="collection"
      :get-mapping="getMappingDocument"
      :submitted="submitted"
      @document-create::create="create"
      @document-create::cancel="cancel"
      @document-create::reset-error="error = null"
      @document-create::error="setError"
      @change-id="updateId"
    />
  </div>
  <div v-else>
    <page-not-allowed />
  </div>
</template>

<script>
import { canCreateDocument } from '../../../services/userAuthorization'
import PageNotAllowed from '../../Common/PageNotAllowed'

import CollectionDropdown from '../Collections/Dropdown'
import Headline from '../../Materialize/Headline'
import { getMappingDocument } from '../../../services/kuzzleWrapper'
import CreateOrUpdate from './Common/CreateOrUpdate'
import CollectionTabs from '../Collections/Tabs'

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
  data() {
    return {
      error: '',
      document: {},
      id: null,
      submitted: false
    }
  },
  computed: {
    hasRights() {
      return canCreateDocument(this.index, this.collection)
    }
  },
  methods: {
    getMappingDocument,
    updateId(id) {
      this.id = id
    },
    async create(document) {
      this.error = ''

      if (!document) {
        this.error = 'The document is invalid, please review it'
        return
      }

      this.submitted = true

      let id = this.id

      if (document._id) {
        id = document._id
        delete document._id
      }

      try {
        await this.$kuzzle.document.create(
          this.index,
          this.collection,
          document,
          id,
          { refresh: 'wait_for' }
        )
        await this.$store.dispatch.collection.fetchCollectionDetail({
          index: this.index,
          collection: this.collection
        })
        this.$router.push({
          name: 'DataDocumentsList',
          params: { index: this.index, collection: this.collection }
        })
      } catch (err) {
        this.error =
          'An error occurred while trying to create the document: <br/> ' +
          err.message
        this.submitted = false
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.go(this.$router._prevTransition.to)
      } else {
        this.$router.push({
          name: 'DataDocumentsList',
          params: { index: this.index, collection: this.collection }
        })
      }
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
