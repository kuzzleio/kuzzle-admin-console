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
          aria-label="Search index and collection"
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
<script setup lang="ts">
import { computed, ref } from 'vue';

import { Alert } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { filterIndexesByKeyword } from '@/services/indexHelpers';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import IndexBranch from './IndexBranch.vue';

defineProps<{
  indexName?: string;
  collectionName?: string;
}>();

const authStore = useAuthStore();
const storageIndexStore = useStorageIndexStore();

const filter = ref('');

const canSearchIndex = computed(() => authStore.canSearchIndex);
const isLoading = computed(() => storageIndexStore.loadingIndexes);
const orderedFilteredIndexes = computed(() =>
  [...filterIndexesByKeyword(storageIndexStore.indexes, filter.value)].sort((a, b) =>
    a.name.localeCompare(b.name),
  ),
);
</script>
