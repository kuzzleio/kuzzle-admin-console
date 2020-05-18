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
    index: String
  },
  computed: {
    ...mapGetters('auth', ['canCreateCollection']),
    hasRights() {
      return this.canCreateCollection(this.index, this.collection)
    }
  },
  methods: {
    async create(payload) {
      try {
        await this.$store.direct.dispatch.index
          .createCollectionInIndex({
            index: this.index,
            collection: payload.name,
            isRealtimeOnly: payload.realtimeOnly,
            mapping: payload.mapping,
            dynamic: payload.dynamic
          })
          .then(() => {
            this.$router.push({
              name: 'Collections',
              params: { index: this.index }
            })
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
