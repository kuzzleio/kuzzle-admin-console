<template>
  <b-overlay class="h-100" opacity="1" :show="this.isLoading">
    <aside class="Treeview h-100">
      <div
        v-if="!canSearchIndex()"
        class="Treeview-notAuth px-3 text-center"
        v-show="!isLoading"
      >
        <b-alert show variant="info">
          <i class="fa fa-lock fa-2x" aria-hidden="true" />
          <br />
          <em>You are not allowed to list indexes</em>
        </b-alert>
      </div>
      <template v-else>
        <div class="Treeview-search p-3">
          <b-form-input
            v-model="filter"
            data-cy="Treeview-filter"
            placeholder="Search index &amp; collection"
            type="search"
          ></b-form-input>
        </div>
        <div class="Treeview-items p-3">
          <router-link
            data-cy="Treeview-item"
            class="text-secondary"
            :to="{ name: 'Data' }"
          >
            <i class="fas fa-list mr-1"></i>
            All indexes
          </router-link>
          <index-branch
            v-for="indexName in orderedFilteredIndices"
            :collections="indexesAndCollections[indexName]"
            :current-collection="collection"
            :current-index="index"
            :data-cy="`Treeview-item-index--${indexName}`"
            :filter="filter"
            :index-name="indexName"
            :key="indexName"
          />
        </div>
      </template>
    </aside>
  </b-overlay>
</template>

<style lang="scss" scoped>
.Treeview {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.Treeview-search {
  border-bottom: 1px solid #dbdbdb;
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
    collection: String
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
          this.$store.direct.state.index.indexesAndCollections,
          this.filter
        )
      ].sort()
    },
    indexesAndCollections() {
      return Object.keys(this.$store.state.index.indexesAndCollections).length
        ? this.$store.state.index.indexesAndCollections
        : {}
    },
    isLoading() {
      return (
        this.$store.direct.getters.index.loadingIndexes ||
        this.$store.direct.getters.index.loadingCollections
      )
    }
  },
  methods: {
    canSearchIndex
  }
}
</script>
