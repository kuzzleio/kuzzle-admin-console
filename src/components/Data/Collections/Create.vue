<template>
  <b-container class="CollectionCreate h-100">
    <create-or-update
      v-if="hasRights"
      headline="Create a new collection"
      submit-label="Create"
      :index="index.name"
      @submit="create"
    />
    <page-not-allowed v-else />
  </b-container>
</template>

<script>
import PageNotAllowed from '../../Common/PageNotAllowed'
import CreateOrUpdate from './CreateOrUpdate'
import { mapGetters } from 'vuex'
export default {
  name: 'CollectionCreate',
  components: {
    CreateOrUpdate,
    PageNotAllowed
  },
  props: {
    indexName: String
  },
  computed: {
    ...mapGetters('auth', ['canCreateCollection']),
    hasRights() {
      return this.canCreateCollection(this.index.name)
    },
    index() {
      return this.$store.direct.getters.index.getOneIndex(this.indexName)
    }
  },
  methods: {
    async create(payload) {
      try {
        await this.$store.direct.dispatch.index.createCollection({
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
