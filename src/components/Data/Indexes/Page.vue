<template>
  <div class="IndexesPage mx-auto w-full max-w-6xl px-4 pb-12" data-cy="IndexesPage">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <headline>Indexes</headline>
      <Button
        v-if="canCreateIndex"
        class="mt-3"
        data-cy="IndexesPage-createBtn"
        @click.prevent="openCreateModal"
      >
        <i class="fa fa-plus-circle" />
        Create an index
      </Button>
    </div>

    <list-not-allowed v-if="!canSearchIndex" />
    <template v-else>
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <span class="flex-1 text-sm text-muted-foreground">
          {{ indexes.length }}
          {{ indexes.length === 1 ? 'index' : 'indexes' }}
        </span>

        <Button variant="outline" @click="onToggleAllClicked">
          <i :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`" />
          Toggle all
        </Button>

        <Button
          data-cy="IndexesPage-bulkDelete--btn"
          :disabled="!bulkDeleteEnabled"
          variant="destructive"
          @click="openBulkDeleteModal"
        >
          <i class="fa fa-minus-circle" />
          Delete
        </Button>

        <div class="flex items-stretch overflow-hidden rounded-sm border border-input">
          <label
            class="flex items-center bg-muted px-3 font-sans text-sm text-muted-foreground"
            for="indexes-filter"
            >Filter</label
          >
          <Input
            id="indexes-filter"
            v-model="filter"
            v-focus
            class="rounded-none border-0"
            data-cy="IndexesPage-filter"
            :disabled="indexes.length === 0"
            @keyup.enter="navigateToIndex"
          />
        </div>
      </div>

      <Table class="border border-border">
        <TableHeader>
          <TableRow>
            <TableHead class="w-8" />
            <TableHead class="w-10" />
            <TableHead :aria-sort="ariaSort('name')">
              <Button
                class="px-1 text-muted-foreground"
                data-cy="IndexesPage-sort--name"
                size="sm"
                variant="ghost"
                @click="toggleSort('name')"
              >
                Name
                <i :class="sortIcon('name')" />
              </Button>
            </TableHead>
            <TableHead :aria-sort="ariaSort('collections')" class="w-40 text-center">
              <Button
                class="px-1 text-muted-foreground"
                data-cy="IndexesPage-sort--collections"
                size="sm"
                variant="ghost"
                @click="toggleSort('collections')"
              >
                Collections
                <i :class="sortIcon('collections')" />
              </Button>
            </TableHead>
            <TableHead class="w-56" />
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="rows.length === 0">
            <TableCell class="py-6 text-center" colspan="5">
              <template v-if="filtering">
                <h4 class="text-title font-bold text-muted-foreground">
                  There is no index matching your filter.
                </h4>
              </template>
              <template v-else>
                <h4 class="text-title font-bold text-muted-foreground">There is no index.</h4>
                <p v-if="canCreateIndex" class="text-muted-foreground">
                  You can create one by hitting the button above.
                </p>
              </template>
            </TableCell>
          </TableRow>

          <TableRow v-for="index of rows" :key="index.name">
            <TableCell>
              <Checkbox
                :aria-label="`Select index ${index.name}`"
                :checked="isChecked(index)"
                :data-cy="`IndexesPage-checkbox--${index.name}`"
                @change="onCheckboxClick(index)"
              />
            </TableCell>
            <TableCell class="text-muted-foreground">
              <i class="fa fa-2x fa-database" />
            </TableCell>
            <TableCell class="code">
              <router-link
                class="font-medium text-foreground hover:underline"
                :data-cy="`IndexesPage-name--${index.name}`"
                :title="index.name"
                :to="{
                  name: 'Collections',
                  params: { indexName: index.name },
                }"
              >
                {{ index.name }}
              </router-link>
            </TableCell>
            <TableCell class="text-center">
              {{ index.collectionsCount || '--' }}
            </TableCell>
            <TableCell class="text-right">
              <Button
                :as="RouterLink"
                :data-cy="`IndexesPage-browse--${index.name}`"
                size="icon"
                title="browse this index"
                :to="{
                  name: 'Collections',
                  params: { indexName: index.name },
                }"
                variant="ghost"
                ><i class="fa fa-eye"
              /></Button>
              <Button
                :as="RouterLink"
                :data-cy="`IndexesPage-createCollection--${index.name}`"
                size="icon"
                title="Create a collection in this index"
                :to="{
                  name: 'CreateCollection',
                  params: { indexName: index.name },
                }"
                variant="ghost"
                ><i class="fa fa-plus"
              /></Button>
              <Button
                :data-cy="`IndexesPage-delete--${index.name}`"
                size="icon"
                title="Delete index"
                variant="ghost"
                @click="openDeleteModal(index)"
                ><i class="fa fa-trash"
              /></Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>

    <CreateIndexModal v-model:open="createIndexOpen" @create-successful="onCreateModalSuccess" />
    <DeleteIndexModal
      ref="deleteIndexModal"
      v-model:open="deleteIndexOpen"
      :index="indexToDelete"
      @confirm-deletion="onConfirmDeleteModal"
      @cancel="onCancelDeleteModal"
    />
    <BulkDeleteIndexesModal
      v-model:open="bulkDeleteIndexesOpen"
      :indexes="selectedIndexes"
      @delete-successful="onDeleteModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTableFilterSort } from '@/composables/useTableFilterSort';
import { useToast } from '@/composables/useToast';
import vFocus from '@/directives/focus.directive';
import { caught } from '@/lib/errors';
import { logger } from '@/plugins/logger';
import { useAuthStore, useStorageIndexStore } from '@/stores';
import type { Index } from '@/stores/types/storage-index';

import ListNotAllowed from '@/components/Common/ListNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import BulkDeleteIndexesModal from './BulkDeleteIndexesModal.vue';
import CreateIndexModal from './CreateIndexModal.vue';
import DeleteIndexModal from './DeleteIndexModal.vue';

// `v-focus` plutôt que l'attribut `autofocus` : le navigateur ne l'honore
// qu'au chargement du document, pas quand Vue insère l'élément plus tard.
// `b-form-input` avait sa propre prop `autofocus`, qui appelait `focus()`
// au montage (G-023).

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const storageIndexStore = useStorageIndexStore();

// Le filtre ne porte que sur le nom. `b-table` sérialisait la ligne
// entière : un index remontait sur le nom de ses collections chargées, ou
// sur `loading` (ADR-0011).
const { filter, rows, filtering, toggleSort, ariaSort } = useTableFilterSort(
  () => storageIndexStore.indexes,
  {
    filterOn: (index) => [index.name],
    sorters: {
      collections: (index) => index.collectionsCount,
      name: (index) => index.name,
    },
  },
);

const deleteIndexModal = useTemplateRef<InstanceType<typeof DeleteIndexModal>>('deleteIndexModal');

const bulkDeleteIndexesOpen = ref(false);
const createIndexOpen = ref(false);
const deleteIndexOpen = ref(false);
const indexToDelete = ref<Index | null>(null);
const selectedIndexes = ref<Index[]>([]);

const canSearchIndex = computed(() => authStore.canSearchIndex);
const canCreateIndex = computed(() => authStore.canCreateIndex);
const indexes = computed(() => storageIndexStore.indexes);
const bulkDeleteEnabled = computed(() => selectedIndexes.value.length > 0);
const allChecked = computed(() => selectedIndexes.value.length === rows.value.length);

function sortIcon(key: string): string {
  const sort = ariaSort(key);

  if (sort === 'none') {
    return 'fa fa-sort opacity-50';
  }

  return sort === 'ascending' ? 'fa fa-sort-up' : 'fa fa-sort-down';
}

function openCreateModal(): void {
  createIndexOpen.value = true;
}

function openDeleteModal(index: Index): void {
  indexToDelete.value = index;
  deleteIndexOpen.value = true;
}

function openBulkDeleteModal(): void {
  bulkDeleteIndexesOpen.value = true;
}

async function onCancelDeleteModal(): Promise<void> {
  deleteIndexOpen.value = false;
  await refreshIndexes();
}

async function onConfirmDeleteModal(): Promise<void> {
  // La modale ne confirme que si un index lui a été passé.
  if (indexToDelete.value === null) {
    return;
  }

  try {
    await storageIndexStore.deleteIndex(indexToDelete.value);
    deleteIndexOpen.value = false;
    await refreshIndexes();
  } catch (err) {
    deleteIndexModal.value?.setError(caught(err).message);
  }
}

async function onDeleteModalSuccess(): Promise<void> {
  await refreshIndexes();
}

async function onCreateModalSuccess(): Promise<void> {
  await refreshIndexes();
}

async function refreshIndexes(): Promise<void> {
  try {
    await storageIndexStore.fetchIndexList();
  } catch (err) {
    logger.error(err);
    toast.danger(caught(err).message, 'The complete error has been printed to the console.');
  }
}

function onToggleAllClicked(): void {
  if (allChecked.value) {
    selectedIndexes.value = [];
    return;
  }
  selectedIndexes.value = [];
  selectedIndexes.value = rows.value;
}

function isChecked(index: Index): boolean {
  return !!selectedIndexes.value.find((el) => el.name === index.name);
}

function onCheckboxClick(index: Index): void {
  const indexAlreadySelected = selectedIndexes.value.find((el) => el.name === index.name);

  if (!indexAlreadySelected) {
    selectedIndexes.value.push(index);
    return;
  }

  selectedIndexes.value = selectedIndexes.value.filter((el) => el.name !== index.name);
}

function navigateToIndex(): void {
  const index = rows.value[0];

  if (!index) {
    return;
  }

  router.push({
    name: 'Collections',
    params: { indexName: index.name },
  });
}
</script>
