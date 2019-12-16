<template>
  <div v-if="hasRights" class="wrapper">
    <headline>
      Edit document - <span class="bold">{{ $route.params.id }}</span>
      <collection-dropdown
        class="icon-medium icon-black"
        :index="index"
        :collection="collection"
      />
    </headline>

    <collection-tabs />
    <div v-if="show" class="row">
      <div class="card horizontal tertiary col m5">
        <div class="card-content">
          <span class="card-title">Warning</span>
          <p>
            This document has been edited while you were editing it.
            <a href="#" @click.prevent="refresh">Click here to refresh it</a>
          </p>
        </div>
      </div>
    </div>
    <create-or-update
      v-model="document"
      :error="error"
      :index="index"
      :collection="collection"
      :hide-id="true"
      :get-mapping="getMappingDocument"
      :submitted="submitted"
      @document-create::create="update"
      @document-create::cancel="cancel"
      @document-create::reset-error="error = null"
      @document-create::error="setError"
    />
  </div>
  <div v-else>
    <page-not-allowed />
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
.bold {
  font-weight: normal;
}
</style>

<script>
import { canEditDocument } from '../../../services/userAuthorization'
import PageNotAllowed from '../../Common/PageNotAllowed'

import CollectionDropdown from '../Collections/Dropdown'
import Headline from '../../Materialize/Headline'
import { getMappingDocument } from '../../../services/kuzzleWrapper'
import CreateOrUpdate from './Common/CreateOrUpdate'
import CollectionTabs from '../Collections/Tabs'
import { SET_TOAST } from '../../../vuex/modules/common/toaster/mutation-types'

let room

export default {
  name: 'DocumentUpdate',
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
      show: false,
      document: {},
      submitted: false
    }
  },
  computed: {
    hasRights() {
      return canEditDocument(this.index, this.collection)
    }
  },
  async mounted() {
    this.fetch()
    this.room = await this.$kuzzle.realtime.subscribe(
      this.index,
      this.collection,
      { ids: { values: [this.$route.params.id] } },
      () => {
        this.show = true
      }
    )
  },
  destroyed() {
    if (room) {
      room.unsubscribe()
    }
  },
  methods: {
    getMappingDocument,
    async update(document, replace = false) {
      this.submitted = true
      this.error = ''

      if (!document) {
        this.error = 'The document is invalid, please review it'
        return
      }

      try {
        let action = 'update'
        if (replace === true) {
          action = 'replace'
        }
        await this.$kuzzle.document[action](
          this.index,
          this.collection,
          this.$route.params.id,
          document,
          { refresh: 'wait_for' }
        )
        this.$router.push({
          name: 'DataDocumentsList',
          params: { index: this.index, collection: this.collection }
        })
      } catch (err) {
        this.error =
          'An error occurred while trying to update the document: <br/> ' +
          err.message
        this.submitted = false
      }
    },
    cancel() {
      if (this.$router._prevTransition && this.$router._prevTransition.to) {
        this.$router.push(this.$router._prevTransition.to)
      } else {
        this.$router.push({
          name: 'DataDocumentsList',
          params: { index: this.index, collection: this.collection }
        })
      }
    },
    async fetch() {
      this.show = false
      try {
        const res = await this.$kuzzle.document.get(
          this.index,
          this.collection,
          this.$route.params.id
        )
        this.document = res._source
        this.$emit('document-create::fill', res._source)
      } catch (err) {
        this.$store.commit(SET_TOAST, { text: err.message })
      }
    },
    setError(payload) {
      this.error = payload
    },
    refresh() {
      this.$router.go()
    }
  }
}
</script>
