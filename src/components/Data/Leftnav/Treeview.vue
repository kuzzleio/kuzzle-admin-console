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
        />
      </div>
      <div class="Treeview-items p-3">
        <router-link data-cy="Treeview-item" class="text-secondary" :to="{ name: 'Data' }">
          <i class="fas fa-list mr-1" />
          All indexes <b-spinner v-if="isLoading" small />
        </router-link>
        <index-branch
          v-for="index in orderedFilteredIndexes"
          :key="index.name"
          :index="index"
          :browsed-index-name="indexName"
          :browsed-collection-name="collectionName"
          :filter="filter"
          :data-cy="`Treeview-item-index--${index.name}`"
        />
      </div>
    </template>
  </aside>
</template>

<script>
import { mapState } from 'pinia';

import { filterIndexesByKeyword } from '@/services/indexHelpers';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import IndexBranch from './IndexBranch.vue';

export default {
  name: 'Treeview',
  components: {
    IndexBranch,
  },
  props: {
    indexName: String,
    collectionName: String,
  },
  setup() {
    return {
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      filter: '',
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canSearchIndex']),
    orderedFilteredIndexes() {
      return [...filterIndexesByKeyword(this.indexes, this.filter)].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    },
    isLoading() {
      return this.storageIndexStore.loadingIndexes;
    },
    indexes() {
      return this.storageIndexStore.indexes;
    },
  },
};
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
