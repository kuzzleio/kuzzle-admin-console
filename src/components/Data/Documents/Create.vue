<template>
  <b-container class="DocumentCreate">
    <template v-if="hasRights" class="wrapper">
      <headline>
        Create a new document
      </headline>

      <create-or-update
        :index="index"
        :collection="collection"
        :mapping="mapping"
        @cancel="onCancel"
        @submit="onSubmit"
      />
    </template>
    <template v-else>
      <page-not-allowed />
    </template>
  </b-container>
</template>

<style lang="scss" scoped>
.DocumentCreate {
  height: 100%;
}
</style>

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
    index: String,
    collection: String
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
    hasRights() {
      return this.canCreateDocument(this.index, this.collection)
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
          this.index,
          this.collection,
          document,
          id,
          { refresh: 'wait_for' }
        )
        await this.$store.direct.dispatch.collection.fetchCollectionDetail({
          index: this.index,
          collection: this.collection
        })
        this.$router.push({
          name: 'DocumentList',
          params: { index: this.index, collection: this.collection }
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
    async fetch() {
      try {
        const details = await this.$store.direct.dispatch.collection.fetchCollectionDetail(
          {
            index: this.index,
            collection: this.collection
          }
        )
        this.$log.debug(`fetched mapping`)
        this.$log.info(details)
        this.mapping = details.mapping
      } catch (err) {
        this.$log.error(err)
        this.$bvToast.toast(err.message, {
          title:
            'Ooops! Something went wrong while loading the collection mapping.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    }
  },
  mounted() {
    this.fetch()
  }
}
</script>
