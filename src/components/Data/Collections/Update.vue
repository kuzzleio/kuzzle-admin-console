<template>
  <div v-if="hasRights">
    <create-or-update
      headline="Update collection"
      submit-label="Update"
      :collection="collection"
      :index="index"
      :dynamic="dynamic"
      :mapping="mapping"
      :realtime-only="realtimeOnly"
      @submit="update"
    />
  </div>
  <div v-else>
    <page-not-allowed />
  </div>
</template>

<script>
import { canEditCollection } from '../../../services/userAuthorization'
import PageNotAllowed from '../../Common/PageNotAllowed'

import CreateOrUpdate from './CreateOrUpdate'

export default {
  name: 'CollectionUpdate',
  components: {
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    index: { type: String, required: true },
    collection: { type: String, required: true }
  },
  data() {
    return {
      dynamic: 'false',
      mapping: {},
      realtimeOnly: false
    }
  },
  computed: {
    hasRights() {
      return canEditCollection(this.index, this.collection)
    }
  },
  async mounted() {
    try {
      await this.$store.direct.dispatch.index.listIndexesAndCollections()
      const details = await this.$store.direct.dispatch.collection.fetchCollectionDetail(
        {
          index: this.index,
          collection: this.collection
        }
      )

      this.dynamic = details.dynamic
      this.mapping = details.mapping
      this.realtimeOnly = details.realtimeOnly
    } catch (e) {
      this.$log.error(e)
      this.$bvToast.toast(e.message, {
        title:
          'Ooops! Something went wrong while fetching the details of the collection.',
        variant: 'warning',
        toaster: 'b-toaster-bottom-right',
        appendToast: true,
        dismissible: true,
        noAutoHide: true
      })
    }
  },
  methods: {
    async update(payload) {
      this.error = ''

      try {
        await this.$store.direct.dispatch.collection.updateCollection({
          index: this.index,
          name: payload.name,
          mapping: payload.mapping,
          realtimeOnly: payload.realtimeOnly,
          dynamic: payload.dynamic
        })
        this.$router.push({
          name: 'Indexes',
          params: { index: this.index }
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
