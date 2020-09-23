<template>
  <b-container class="DocumentCreate d-flex flex-column h-100">
    <template v-if="hasRights" class="wrapper">
      <headline>
        Create a new document
      </headline>

      <create-or-update
        :index="indexName"
        :collection="collectionName"
        :mapping="this.collection.mapping"
        @cancel="onCancel"
        @submit="onSubmit"
      />
    </template>
    <template v-else>
      <page-not-allowed />
    </template>
  </b-container>
</template>

<script>
import PageNotAllowed from '../../Common/PageNotAllowed'
import { mapGetters } from 'vuex'
import Headline from '../../Materialize/Headline'
import CreateOrUpdate from './Common/CreateOrUpdate'

export default {
  name: 'DocumentCreate',
  components: {
    Headline,
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    indexName: String,
    collectionName: String
  },
  data() {
    return {
      mapping: {},
      submitting: false
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle']),
    ...mapGetters('auth', ['canCreateDocument']),
    index() {
      return this.$store.direct.getters.index.getOneIndex(this.indexName)
    },
    collection() {
      return this.$store.direct.getters.index.getOneCollection(
        this.index,
        this.collectionName
      )
    },
    hasRights() {
      return this.canCreateDocument(this.indexName, this.collectionName)
    }
  },
  methods: {
    async onSubmit(document, id) {
      if (!document) {
        this.error = 'The document is invalid, please review it'
        return
      }

      this.submitting = true

      try {
        await this.$kuzzle.document.create(
          this.indexName,
          this.collectionName,
          document,
          id,
          { refresh: 'wait_for' }
        )

        await this.fetchCollectionMapping()

        this.$router.push({
          name: 'DocumentList',
          params: {
            indexName: this.indexName,
            collectionName: this.collectionName
          }
        })
      } catch (err) {
        this.$log.error(err)
        this.$bvToast.toast(err.message, {
          title: 'Ooops! Something went wrong while persisting the document.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    },
    onCancel() {
      this.$router.push({
        name: 'DocumentList',
        params: { index: this.index, collection: this.collection }
      })
    },
    async fetchCollectionMapping() {
      try {
        this.$store.direct.dispatch.index.fetchCollectionMapping({
          index: this.index,
          collection: this.collection
        })
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while counting documents in collections.',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true
          }
        )
      }
    }
  },
  async mounted() {
    if (!this.collection || !this.index) {
      return
    }

    await this.fetchCollectionMapping()
  }
}
</script>
