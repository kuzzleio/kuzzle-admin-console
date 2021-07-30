<template>
  <aside class="Treeview h-100">
    <div v-if="!canSearchIndex" class="Treeview-notAuth px-3 text-center">
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
          All indexes <b-spinner small v-if="isLoading"></b-spinner>
        </router-link>
        <index-branch
          v-for="index in orderedFilteredIndexes"
          :index="index"
          :browsed-index-name="indexName"
          :browsed-collection-name="collectionName"
          :filter="filter"
          :key="index.name"
          :data-cy="`Treeview-item-index--${index.name}`"
        />
      </div>
    </template>
  </aside>
</template>

<script>
import IndexBranch from './IndexBranch' ;
import { filterIndexesByKeyword } from '../../../services/indexHelpers' ;
import { mapGetters } from 'vuex' ;

export default {
  name: 'Treeview',
  components: {
    IndexBranch
  },
  props: {
    indexName: String,
    collectionName: String
  },
  data() {
    return {
      filter: ''
    } ;
  },
  computed: {
    ...mapGetters('auth', ['canSearchIndex']),
    orderedFilteredIndexes() {
      return [
        ...filterIndexesByKeyword(this.indexes, this.filter)
      ].sort((a, b) => a.name.localeCompare(b.name))
    },
    isLoading() {
      return this.$store.direct.getters.index.loadingIndexes ;
    },
    indexes() {
      return this.$store.direct.getters.index.indexes ;
    }
  }
} ;
</script>

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
