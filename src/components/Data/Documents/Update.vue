<template>
  <b-container class="DocumentUpdate">
    <template v-if="hasRights">
      <headline>
        Edit document
      </headline>

      <b-alert variant="danger" :show="showAlert">
        <b>Warning!</b> This document has been edited while you were editing it.
        If you save now, you will overwrite someone else's modifications.
      </b-alert>
      <div v-if="loading" class="text-center">
        <b-spinner
          style="width: 3rem; height: 3rem; margin-top: 3em"
          label="Large Spinner"
          variant="primary"
        ></b-spinner>
      </div>
      <create-or-update
        v-else
        :id="id"
        :index="index"
        :collection="collection"
        :document="document"
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
.DocumentUpdate {
  height: 100%;
}
</style>

<script>
import PageNotAllowed from '../../Common/PageNotAllowed'
import Headline from '../../Materialize/Headline'
import CreateOrUpdate from './Common/CreateOrUpdate'
import { omit } from 'lodash'
import { mapGetters } from 'vuex'
let room

export default {
  name: 'DocumentUpdate',
  components: {
    Headline,
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    id: { type: String, required: true },
    index: { type: String, required: true },
    collection: { type: String, required: true }
  },
  data() {
    return {
      document: {},
      loading: false,
      mapping: {},
      showAlert: false
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['$kuzzle', 'wrapper']),
    ...mapGetters('auth', ['canEditDocument']),
    hasRights() {
      return this.canEditDocument(this.index, this.collection)
    }
  },
  async mounted() {
    this.fetch()
    this.room = await this.$kuzzle.realtime.subscribe(
      this.index,
      this.collection,
      { ids: { values: [this.$route.params.id] } },
      () => {
        this.showAlert = true
      }
    )
  },
  destroyed() {
    if (room) {
      room.unsubscribe()
    }
  },
  methods: {
    async onSubmit(document, id, replace = false) {
      this.submitted = true
      this.error = ''

      if (!document) {
        this.error = 'The document is invalid, please review it'
        return
      }

      try {
        delete document._id
        let action = 'update'
        if (replace === true) {
          action = 'replace'
        }
        await this.$kuzzle.document[action](
          this.index,
          this.collection,
          this.id,
          document,
          { refresh: 'wait_for' }
        )
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
      this.showAlert = false
      this.loading = true
      try {
        const res = await this.$kuzzle.document.get(
          this.index,
          this.collection,
          this.id
        )
        this.document = omit(res._source, '_kuzzle_info')
        this.mapping = await this.wrapper.getMappingDocument(
          this.collection,
          this.index
        )
        this.loading = false
      } catch (err) {
        this.$log.error(err)
        this.$bvToast.toast(err.message, {
          title: 'Ooops! Something went wrong while loading the document.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    }
  }
}
</script>
