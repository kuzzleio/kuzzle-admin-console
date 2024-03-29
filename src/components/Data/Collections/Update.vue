<template>
  <b-container class="CollectionUpdate h-100">
    <div v-if="hasRights" class="h-100">
      <create-or-update
        v-if="index && collection"
        headline="Update collection"
        submit-label="Update"
        :collection="collection.name"
        :index="index.name"
        :mapping="fullMappings"
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
import { mapGetters } from 'vuex'
import { omit } from 'lodash'

export default {
  name: 'CollectionUpdate',
  components: {
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    indexName: { type: String, required: true },
    collectionName: { type: String, required: true }
  },
  data() {
    return {
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
    fullMappings() {
      const mappings = {
        dynamic: this.collection.dynamic,
        properties: omit(this.collection.mapping, '_kuzzle_info')
      }

      return mappings
    },
    loading() {
      return this.$store.direct.getters.index.loadingCollections(
        this.index.name
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
          mapping: payload.mapping
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
