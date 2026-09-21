<template>
  <aside class="Treeview tw:flex tw:h-full tw:flex-col">
    <div v-if="!canSearchIndex" class="Treeview-notAuth tw:px-3 tw:text-center">
      <Alert>
        <i aria-hidden="true" class="fa fa-lock fa-2x" />
        <br />
        <em>You are not allowed to list indexes</em>
      </Alert>
    </div>
    <template v-else>
      <div class="tw:border-b tw:border-border tw:p-3">
        <Input
          v-model="filter"
          data-cy="Treeview-filter"
          placeholder="Search index &amp; collection"
          type="search"
        />
      </div>
      <div class="tw:min-h-0 tw:flex-1 tw:overflow-y-auto tw:p-3">
        <router-link class="tw:text-secondary" data-cy="Treeview-item" :to="{ name: 'Data' }">
          <i class="fas fa-list tw:mr-1" aria-hidden="true" />
          All indexes <Spinner v-if="isLoading" size="sm" />
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

import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { filterIndexesByKeyword } from '@/services/indexHelpers';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import IndexBranch from './IndexBranch.vue';

export default {
  name: 'Treeview',
  components: {
    Alert,
    IndexBranch,
    Input,
    Spinner,
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
