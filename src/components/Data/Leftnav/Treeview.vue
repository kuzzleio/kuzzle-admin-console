<template>
  <aside class="Treeview h-100">
    <b-nav vertical>
      <b-nav-item v-if="!canSearchIndex()">
        <i class="fa fa-lock" aria-hidden="true" />
        <em>You are not allowed to list indexes</em>
      </b-nav-item>
      <b-nav-item v-else>
        <div class="">
          <b-form-input
            type="search"
            v-model="filter"
            placeholder="Search index &amp; collection"
          ></b-form-input>
        </div>
      </b-nav-item>
      <b-nav-item v-for="indexName in orderedFilteredIndices" :key="indexName">
        <index-branch
          :index-name="indexName"
          :route-name="routeName"
          :collections="indexesAndCollections[indexName]"
          :current-index="index"
          :filter="filter"
          :current-collection="collection"
        />
      </b-nav-item>
    </b-nav>
  </aside>
</template>

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
