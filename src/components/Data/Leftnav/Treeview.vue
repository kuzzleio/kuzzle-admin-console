<template>
  <aside class="Treeview h-100">
    <div v-if="!canSearchIndex()" class="Treeview-notAuth px-3 text-center">
      <b-alert show variant="info">
        <i class="fa fa-lock fa-2x" aria-hidden="true" />
        <br />
        <em>You are not allowed to list indexes</em>
      </b-alert>
    </div>
    <template v-else>
      <div class="Treeview-search p-3">
        <b-form-input
          type="search"
          v-model="filter"
          placeholder="Search index &amp; collection"
        ></b-form-input>
      </div>
      <div class="Treeview-items px-3">
        <index-branch
          v-for="indexName in orderedFilteredIndices"
          :key="indexName"
          :index-name="indexName"
          :route-name="routeName"
          :collections="indexesAndCollections[indexName]"
          :current-index="index"
          :filter="filter"
          :current-collection="collection"
        />
      </div>
    </template>
  </aside>
</template>

<style lang="scss" scoped>
.Treeview {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.Treeview-search {
  border-bottom: 1px solid $disabled-color;
}
.Treeview-items {
  flex: 1;
  overflow-y: auto;
}
</style>

<script>
import { canSearchIndex } from '../../../services/userAuthorization'
import IndexBranch from './IndexBranch'
import { filterIndexesByKeyword } from '../../../services/data'

export default {
  name: 'Treeview',
  components: {
    IndexBranch
  },
  props: {
    index: String,
    collection: String,
    routeName: String
  },
  data() {
    return {
      filter: ''
    }
  },
  computed: {
    orderedFilteredIndices() {
      return [
        ...filterIndexesByKeyword(
          this.$store.state.index.indexes,
          this.$store.state.index.indexesAndCollections,
          this.filter
        )
      ].sort()
    },
    indexesAndCollections() {
      return Object.keys(this.$store.state.index.indexesAndCollections).length
        ? this.$store.state.index.indexesAndCollections
        : {}
    }
  },
  methods: {
    canSearchIndex
  }
}
</script>
