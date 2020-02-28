<template>
  <b-container class="CollectionCreate">
    <div v-if="hasRights">
      <create-or-update
        headline="Create a new collection"
        submit-label="Create"
        :index="index"
        @submit="create"
      />
    </div>
    <div v-else>
      <page-not-allowed />
    </div>
  </b-container>
</template>

<script>
import { canCreateCollection } from '../../../services/userAuthorization'
import PageNotAllowed from '../../Common/PageNotAllowed'
import CreateOrUpdate from './CreateOrUpdate'

export default {
  name: 'CollectionCreate',
  components: {
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    index: String
  },
  computed: {
    hasRights() {
      return canCreateCollection(this.index, this.collection)
    }
  },
  methods: {
    async create(payload) {
      try {
        await this.$store.direct.dispatch.index.createCollectionInIndex({
          index: this.index,
          collection: payload.name,
          isRealtimeOnly: payload.realtimeOnly,
          mapping: payload.mapping,
          dynamic: payload.dynamic
        })
        this.$router.push({
          name: 'DataIndexSummary',
          params: { index: this.index }
        })
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast(error.message, {
          title: 'Ooops! Something went wrong while creating the collection.',
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

<style lang="scss" scoped>
.CollectionCreate {
  margin-bottom: 4em;
}
</style>
