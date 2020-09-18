<template>
  <b-container class="CollectionUpdate h-100">
    <template v-if="loading">
      <main-spinner />
    </template>
    <div v-else-if="hasRights" class="h-100">
      <create-or-update
        headline="Update collection"
        submit-label="Update"
        :collection="collection.name"
        :index="index.name"
        :dynamic="collection.dynamic"
        :mapping="collection.mapping"
        :realtime-only="collection.isRealtime()"
        @submit="update"
      />
    </div>
    <div v-else>
      <page-not-allowed />
    </div>
  </b-container>
</template>
<script>
import PageNotAllowed from '../../Common/PageNotAllowed'
import CreateOrUpdate from './CreateOrUpdate'
import MainSpinner from '../../Common/MainSpinner'
import { mapGetters } from 'vuex'

export default {
  name: 'CollectionUpdate',
  components: {
    CreateOrUpdate,
    PageNotAllowed,
    MainSpinner
  },
  props: {
    indexName: { type: String, required: true },
    collectionName: { type: String, required: true }
  },
  data() {
    return {
      dynamic: 'false',
      mapping: {},
      realtimeOnly: false
    }
  },
  computed: {
    ...mapGetters('auth', ['canEditCollection']),
    hasRights() {
      return this.canEditCollection(this.indexName, this.collectionName)
    },
    index() {
      return this.$store.direct.getters.index.getOneIndex(this.indexName)
    },
    collection() {
      return this.$store.direct.getters.index.getOneCollection(
        this.index,
        this.collectionName
      )
    },
    loading() {
      return this.$store.direct.getters.index.loadingCollections(
        this.index.name
      )
    }
  },
  mounted() {
    if (!this.collection || !this.index) {
      return
    }

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
  },
  methods: {
    async update(payload) {
      this.error = ''

      try {
        await this.$store.direct.dispatch.index.updateCollection({
          index: this.index,
          name: payload.name,
          isRealtime: payload.realtimeOnly,
          mapping: payload.mapping,
          dynamic: payload.dynamic
        })
        this.$router.push({
          name: 'Collections',
          params: { indexName: this.index.name }
        })
      } catch (e) {
        this.$log.error(e)
        this.$bvToast.toast(e.message, {
          title: 'Ooops! Something went wrong while updating the collection.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
