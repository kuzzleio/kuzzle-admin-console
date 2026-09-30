<template>
  <div>
    <div
      v-if="index"
      class="CollectionList mx-auto w-full max-w-6xl px-4 pb-12"
      data-cy="CollectionList"
    >
      <headline>
        <div class="flex flex-row">
          <span class="flex-1 truncate">
            <i class="fa fa-database text-muted-foreground" /> &nbsp;
            <span class="code">{{ indexName }}</span>
          </span>
          <span class="flex items-center gap-2">
            <Button
              :as="authStore.canCreateCollection(indexName) && index ? RouterLink : 'button'"
              data-cy="CollectionList-create"
              :disabled="!authStore.canCreateCollection(indexName) || !index"
              :title="
                !authStore.canCreateCollection(indexName)
                  ? `Your rights disallow you to create collections on index ${indexName}`
                  : ''
              "
              :to="
                authStore.canCreateCollection(indexName) && index
                  ? { name: 'CreateCollection', params: { indexName } }
                  : undefined
              "
            >
              <i class="fa fa-plus" /> Create a collection
            </Button>
            <IndexDropdownAction
              :index-name="indexName"
              @delete-index-clicked="onDeleteIndexClicked"
            />
          </span>
        </div>
      </headline>

      <list-not-allowed v-if="!authStore.canSearchCollection(indexName)" />
      <div v-else-if="collections" class="CollectionList-content">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <span class="flex-1 text-sm text-muted-foreground">
            {{ collections.length }}
            {{ collections.length === 1 ? 'collection' : 'collections' }}
          </span>

          <Button variant="outline" @click="onToggleAllClicked">
            <i :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`" />
            Toggle all
          </Button>

          <Button
            v-if="currentEnvironment?.backendMajorVersion !== 1"
            data-cy="CollectionList-bulkDelete--btn"
            :disabled="!bulkDeleteEnabled"
            variant="destructive"
            @click="deleteCollections"
          >
            <i class="fa fa-minus-circle" />
            Delete
          </Button>

          <div class="flex items-stretch overflow-hidden rounded-sm border border-input">
            <label
              class="flex items-center bg-muted px-3 font-sans text-sm text-muted-foreground"
              for="collections-filter"
              >Filter</label
            >
            <Input
              id="collections-filter"
              v-model="filter"
              v-focus
              class="rounded-none border-0"
              data-cy="CollectionList-filter"
              :disabled="collections.length === 0"
              @keyup.enter="navigateToCollection"
            />
          </div>
        </div>

        <Table class="border border-border" data-cy="CollectionList-table">
          <TableHeader>
            <TableRow>
              <TableHead class="w-8" />
              <TableHead class="w-10" />
              <TableHead :aria-sort="ariaSort('name')">
                <Button
                  class="px-1 text-muted-foreground"
                  data-cy="CollectionList-sort--name"
                  size="sm"
                  variant="ghost"
                  @click="toggleSort('name')"
                >
                  Name
                  <i :class="sortIcon('name')" />
                </Button>
              </TableHead>
              <TableHead class="w-56" />
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-if="rows.length === 0">
              <TableCell class="py-6 text-center" colspan="4">
                <template v-if="filtering">
                  <h4 class="text-title font-bold text-muted-foreground">
                    There is no collection matching your filter.
                  </h4>
                </template>
                <template v-else>
                  <h4 class="text-title font-bold text-muted-foreground">
                    This index has no collections.
                  </h4>
                  <p v-if="authStore.canCreateCollection(index.name)" class="text-muted-foreground">
                    You can create the collection by hitting the button above.
                  </p>
                </template>
              </TableCell>
            </TableRow>

            <TableRow v-for="collection of rows" :key="collection.name">
              <TableCell>
                <Checkbox
                  :aria-label="`Select collection ${collection.name}`"
                  :checked="isChecked(collection)"
                  :data-cy="`CollectionList-checkbox--${collection.name}`"
                  @change="onCheckboxClick(collection)"
                />
              </TableCell>
              <TableCell class="text-muted-foreground">
                <i
                  class="fa fa-2x"
                  :class="{
                    'fa-bolt': collection.type === 'realtime',
                    'fa-th-list': collection.type === 'stored',
                  }"
                  :title="collection.type === 'realtime' ? 'Realtime' : 'Stored'"
                />
              </TableCell>
              <TableCell class="code">
                <router-link
                  class="font-medium text-foreground hover:underline"
                  :data-cy="`CollectionList-name--${collection.name}`"
                  :title="collection.name"
                  :to="collectionRoute(collection)"
                  >{{ truncateName(collection.name) }}</router-link
                >
              </TableCell>
              <TableCell class="text-right">
                <Button
                  :as="RouterLink"
                  size="icon"
                  title="Browse contents"
                  :to="collectionRoute(collection)"
                  variant="ghost"
                  ><i class="fa fa-eye"
                /></Button>
                <!--
                  `as` bascule sur `button` quand l'édition est interdite : un
                  `router-link` ignore `disabled` et resterait cliquable (G-016).
                -->
                <Button
                  :as="
                    authStore.canEditCollection(indexName, collection.name) ? RouterLink : 'button'
                  "
                  :data-cy="`CollectionList-edit--${collection.name}`"
                  :disabled="
                    collection.type !== 'stored' ||
                    !authStore.canEditCollection(indexName, collection.name)
                  "
                  size="icon"
                  title="Edit collection"
                  :to="
                    authStore.canEditCollection(indexName, collection.name)
                      ? {
                          name: 'EditCollection',
                          params: {
                            indexName: indexName,
                            collectionName: collection.name,
                          },
                        }
                      : undefined
                  "
                  variant="ghost"
                  ><i class="fa fa-pencil-alt"
                /></Button>
                <Button
                  v-if="currentEnvironment?.backendMajorVersion !== 1 && !collection.isRealtime()"
                  :data-cy="`CollectionList-delete--${collection.name}`"
                  size="icon"
                  title="Delete collection"
                  variant="ghost"
                  @click="onDeleteCollectionClicked(collection)"
                  ><i class="fa fa-trash"
                /></Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <DeleteCollectionModal
        v-model:open="deleteCollectionOpen"
        :index="index"
        :collection="collectionToDelete"
        @delete-successful="onDeleteModalSuccess"
      />
      <BulkDeleteCollectionsModal
        v-model:open="bulkDeleteCollectionsOpen"
        :index="index"
        :collections="selectedCollections"
        @delete-successful="onDeleteModalSuccess"
      />
    </div>
    <DeleteIndexModal
      ref="deleteIndexModal"
      v-model:open="deleteIndexOpen"
      :index="index"
      @confirm-deletion="onDeleteIndexConfirm"
      @cancel="onDeleteIndexCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';

import DeleteIndexModal from '../Indexes/DeleteIndexModal.vue';
import IndexDropdownAction from '../Indexes/DropdownActions.vue';
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
import vFocus from '@/directives/focus.directive';
import { caught } from '@/lib/errors';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';
import type { Collection } from '@/stores/types/storage-index';
import { truncateName } from '@/utils';

import ListNotAllowed from '@/components/Common/ListNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import BulkDeleteCollectionsModal from './BulkDeleteCollectionsModal.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';

// `v-focus` plutôt que l'attribut `autofocus` : le navigateur ne l'honore
// qu'au chargement du document, pas quand Vue insère l'élément plus tard.
// `b-form-input` avait sa propre prop `autofocus`, qui appelait `focus()`
// au montage (G-023).
const props = defineProps<{ indexName: string }>();

const router = useRouter();
const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const storageIndexStore = useStorageIndexStore();

// Le filtre ne porte que sur le nom. `b-table` sérialisait la ligne
// entière : taper `stored` remontait toutes les collections stockées,
// parce que `type` fait partie de l'objet même si la colonne n'affiche
// qu'une icône (ADR-0011).
const { filter, rows, filtering, toggleSort, ariaSort } = useTableFilterSort(
  () => storageIndexStore.getOneIndex(props.indexName)?.collections ?? [],
  {
    filterOn: (collection) => [collection.name],
    sorters: {
      name: (collection) => collection.name,
    },
  },
);

const deleteIndexModal = useTemplateRef<InstanceType<typeof DeleteIndexModal>>('deleteIndexModal');

const bulkDeleteCollectionsOpen = ref(false);
const deleteCollectionOpen = ref(false);
const deleteIndexOpen = ref(false);
const collectionToDelete = ref<Collection | null>(null);
const selectedCollections = ref<Collection[]>([]);

const index = computed(() => storageIndexStore.getOneIndex(props.indexName));

const collections = computed(() => (index.value ? index.value.collections : []));

const bulkDeleteEnabled = computed((): boolean => selectedCollections.value.length > 0);

const allChecked = computed((): boolean => selectedCollections.value.length === rows.value.length);

const currentEnvironment = computed(() => kuzzleStore.currentEnvironment);

function sortIcon(key: string): string {
  const sort = ariaSort(key);

  if (sort === 'none') {
    return 'fa fa-sort opacity-50';
  }

  return sort === 'ascending' ? 'fa fa-sort-up' : 'fa fa-sort-down';
}

function collectionRoute(collection: Collection): RouteLocationRaw {
  return {
    name: collection.type === 'realtime' ? 'WatchCollection' : 'DocumentList',
    params: {
      indexName: props.indexName,
      collectionName: collection.name,
    },
  };
}

function onDeleteIndexCancel(): void {
  deleteIndexOpen.value = false;
}

async function onDeleteIndexConfirm(): Promise<void> {
  if (!index.value) {
    return;
  }

  try {
    await storageIndexStore.deleteIndex(index.value);
    deleteIndexOpen.value = false;
    router.push({ name: 'Indexes', params: {} });
  } catch (err) {
    deleteIndexModal.value?.setError(caught(err).message);
  }
}

function onDeleteIndexClicked(): void {
  deleteIndexOpen.value = true;
}

function onDeleteCollectionClicked(collection: Collection): void {
  collectionToDelete.value = collection;
  deleteCollectionOpen.value = true;
}

function deleteCollections(): void {
  bulkDeleteCollectionsOpen.value = true;
}

function onToggleAllClicked(): void {
  if (allChecked.value) {
    selectedCollections.value = [];
    return;
  }

  selectedCollections.value = [];
  selectedCollections.value = rows.value;
}

function isChecked(collection: Collection): boolean {
  return !!selectedCollections.value.find((el) => el.name === collection.name);
}

function onCheckboxClick(collection: Collection): void {
  const collectionAlreadySelected = selectedCollections.value.find(
    (el) => el.name === collection.name,
  );

  if (!collectionAlreadySelected) {
    selectedCollections.value.push(collection);
    return;
  }

  selectedCollections.value = selectedCollections.value.filter((el) => el.name !== collection.name);
}

function onDeleteModalSuccess(): void {
  selectedCollections.value = [];
}

function navigateToCollection(): void {
  const collection = rows.value[0];

  if (!collection) {
    return;
  }

  router.push(collectionRoute(collection));
}
</script>
