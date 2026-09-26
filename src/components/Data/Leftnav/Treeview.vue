<template>
  <aside class="Treeview flex h-full flex-col">
    <div v-if="!canSearchIndex" class="Treeview-notAuth px-3 text-center">
      <Alert>
        <i aria-hidden="true" class="fa fa-lock fa-2x" />
        <br />
        <em>You are not allowed to list indexes</em>
      </Alert>
    </div>
    <template v-else>
      <div class="border-b border-border p-3">
        <Input
          v-model="filter"
          data-cy="Treeview-filter"
          placeholder="Search index &amp; collection"
          type="search"
        />
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        <router-link class="text-muted-foreground" data-cy="Treeview-item" :to="{ name: 'Data' }">
          <i class="fas fa-list mr-1" aria-hidden="true" />
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
