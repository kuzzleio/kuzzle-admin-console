<template>
  <div v-if="hasRights">
    <create-or-update
      :headline="headline"
      :error="error"
      :index="index"
      @collection-create::create="update"
      @collection-create::reset-error="error = ''"
      @document-create::error="setError"
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
    index: String
  },
  data() {
    return {
      error: ''
    }
  },
  computed: {
    headline() {
      return 'Update ' + this.$route.params.collection
    },
    hasRights() {
      return canEditCollection(this.index, this.collection)
    }
  },
  async mounted() {
    try {
      await this.$store.direct.dispatch.index.listIndexesAndCollections()
      await this.$store.direct.dispatch.collection.fetchCollectionDetail({
        index: this.index,
        collection: this.$route.params.collection
      })
    } catch (e) {
      this.$store.direct.commit.toaster.setToast({ text: e.message })
      this.$router.push({
        name: 'Indexes',
        params: { index: this.index }
      })
    }
  },
  methods: {
    async update() {
      this.error = ''

      try {
        await this.$store.direct.dispatch.collection.updateCollection({
          index: this.index
        })
        this.$router.push({
          name: 'Indexes',
          params: { index: this.index }
        })
      } catch (e) {
        this.error = e.message
      }
    },
    setError(payload) {
      this.error = payload
    }
  }
}
</script>
