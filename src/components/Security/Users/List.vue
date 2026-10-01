<template>
  <div class="UserList">
    <slot v-if="isCollectionEmpty && !loading" name="emptySet" />
    <template v-else>
      <Filters
        class="mb-3"
        :available-operands="searchFilterOperands"
        :current-filter="currentFilter"
        :mapping-attributes="mappingAttributes"
        :index="index"
        :collection="collection"
        @filters-updated="onFiltersUpdated"
      />

      <div v-if="loading" class="flex justify-center py-8" data-cy="UserList-loading">
        <Spinner size="lg" />
      </div>

      <template v-else>
        <Card v-if="!isCollectionEmpty" key="list" class="shadow-signature">
          <CardContent>
            <NoSearchResult v-show="!documents.length" />

            <div v-if="documents.length" class="mb-3 flex flex-wrap items-center gap-2">
              <Button data-cy="UserList-toggleAllBtn" variant="outline" @click="toggleAll">
                <i
                  :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`"
                  aria-hidden="true"
                />
                Toggle all
              </Button>

              <Button
                data-cy="UserList-bulkDeleteBtn"
                :disabled="!displayBulkDelete"
                variant="destructive"
                @click="deleteBulk"
              >
                <i class="fa fa-minus-circle" aria-hidden="true" />
                Delete selected
              </Button>

              <PerPageSelector
                class="ml-auto"
                :current-page-size="paginationSize"
                :total-documents="totalDocuments"
                @change-page-size="changePaginationSize($event)"
              />
            </div>

            <ul
              v-show="documents.length"
              class="UserList-list flex list-none flex-col gap-2 pl-0"
              data-cy="UserList-items"
            >
              <li
                v-for="document in documents"
                :key="document.id"
                class="rounded-md border border-border p-2"
                data-cy="UserList-item"
              >
                <UserItem
                  :document="document"
                  :is-checked="isChecked(document.id)"
                  @checkbox-click="toggleSelectDocuments"
                  @edit="editUser"
                  @delete="deleteUser"
                />
              </li>
            </ul>
          </CardContent>
        </Card>

        <ListPagination
          v-show="totalDocuments > paginationSize"
          v-model:page="currentPage"
          class="mt-4"
          data-cy="UserManagement-pagination"
          :items-per-page="paginationSize"
          :total="totalDocuments"
        />
      </template>

      <DeleteModal
        v-model:open="deleteModalOpen"
        :candidates-for-deletion="candidatesForDeletion"
        :is-loading="deleteModalIsLoading"
        @confirm="onDeleteConfirmed"
        @hide="resetCandidatesForDeletion"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import Filters from '../../Common/Filters/Filters.vue';
import type { SearchFilter } from '../../Common/Filters/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import * as filterManager from '@/services/filterManager';
import type { MappingAttributes } from '@/services/mappingHelpers';
import { useAuthStore, useKuzzleStore } from '@/stores';
import type { UserDocument } from './types';

import ListPagination from '@/components/Common/ListPagination.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NoSearchResult from '@/components/Security/Common/NoSearchResult.vue';
import DeleteModal from './DeleteModal.vue';
import UserItem from './UserItem.vue';

const props = withDefaults(
  defineProps<{
    collection?: string;
    displayCreate?: boolean;
    index?: string;
    itemName?: string;
    mappingAttributes: MappingAttributes;
    performDelete?: (...args: unknown[]) => unknown;
    performSearch?: (...args: unknown[]) => unknown;
    routeCreate?: string;
    routeUpdate?: string;
  }>(),
  {
    collection: undefined,
    displayCreate: false,
    index: undefined,
    itemName: undefined,
    performDelete: undefined,
    performSearch: undefined,
    routeCreate: undefined,
    routeUpdate: undefined,
  },
);

const authStore = useAuthStore();
const kuzzleStore = useKuzzleStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const deleteModalOpen = ref(false);
const currentFilter = ref<SearchFilter>(new filterManager.Filter());
const currentPage = ref(1);
const deleteModalIsLoading = ref(false);
const documents = ref<UserDocument[]>([]);
const loading = ref(true);
const searchFilterOperands = filterManager.searchFilterOperands;
const selectedDocuments = ref<string[]>([]);
const totalDocuments = ref(0);
const candidatesForDeletion = ref<string[]>([]);
const paginationSize = ref(25);

const isDocumentSearchFiltered = computed(
  () => currentFilter.value.active !== filterManager.NO_ACTIVE,
);
const isCollectionEmpty = computed(
  () => !isDocumentSearchFiltered.value && totalDocuments.value === 0,
);
const displayBulkDelete = computed(() => selectedDocuments.value.length > 0);
const allChecked = computed(() => selectedDocuments.value.length === documents.value.length);
const paginationFrom = computed(() => Number.parseInt(String(currentFilter.value.from)) || 0);

/* Le wrapper de la connexion courante. Appelé dans un `try` : son absence y
   est une erreur comme une autre. */
function wrapper() {
  const kuzzleWrapper = kuzzleStore.wrapper;
  if (!kuzzleWrapper) {
    throw new Error('No Kuzzle wrapper set for the current environment');
  }
  return kuzzleWrapper;
}

function loadAndSaveFilter(): void {
  currentFilter.value = filterManager.load(props.index, props.collection, route);
  filterManager.save(currentFilter.value, router, props.index, props.collection);
}

function onFiltersUpdated(newFilters: SearchFilter, loadedFromHistory?: boolean): void {
  currentFilter.value = newFilters;
  try {
    filterManager.save(newFilters, router, props.index, props.collection);
    if (!loadedFromHistory) {
      filterManager.addNewHistoryItemAndSave(newFilters, props.index, props.collection);
    }
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while updating the filters',
      'The complete error has been printed to console',
    );
  }
}

/* `$forceUpdate()` précédait le chargement : il ne servait à rien, le
   passage de `loading` à `true` suffit à rendre le spinner. */
async function fetchDocuments(): Promise<void> {
  loading.value = true;

  selectedDocuments.value = [];

  const pagination = {
    from: paginationFrom.value,
    size: paginationSize.value,
  };

  // TODO: refactor how search is done
  // Execute search with corresponding searchQuery
  try {
    /*
     * Dans le `try` : un filtre bien formé mais périmé (un attribut absent
     * du mapping) fait lever la traduction en requête, et la liste restait
     * sur son spinner (#867).
     */
    const searchQuery =
      filterManager.toSearchQuery(
        currentFilter.value,
        props.mappingAttributes,
        kuzzleStore.wrapper,
      ) || {};
    const sorting = filterManager.toSort(currentFilter.value);

    const res = await wrapper().performSearchUsers(
      props.collection,
      props.index,
      searchQuery,
      pagination,
      sorting,
    );
    documents.value = res.documents;
    totalDocuments.value = res.total;
    if (res.documents.length === 0 && res.total !== 0) {
      onFiltersUpdated(
        Object.assign(currentFilter.value, {
          from: 0,
        }),
      );
      return;
    }
  } catch (error) {
    logger.error(error);
    logger.debug(error instanceof Error ? error.stack : undefined);
    toast.warning(
      'Ooops! Something went wrong while fetching users.',
      'The complete error has been printed to console',
    );
  } finally {
    loading.value = false;
  }
}

watch(() => route.fullPath, loadAndSaveFilter);
watch(currentFilter, fetchDocuments);
watch(currentPage, (value) => {
  const from = (value - 1) * paginationSize.value;
  onFiltersUpdated(
    Object.assign(currentFilter.value, {
      from,
    }),
  );
});

onMounted(loadAndSaveFilter);

function changePaginationSize(size: number): void {
  paginationSize.value = size;
  fetchDocuments();
}

function isChecked(id: string): boolean {
  return selectedDocuments.value.includes(id);
}

function toggleAll(): void {
  if (allChecked.value) {
    selectedDocuments.value = [];
    return;
  }
  selectedDocuments.value = documents.value.map((document) => document.id);
}

function toggleSelectDocuments(id: string): void {
  const index = selectedDocuments.value.indexOf(id);

  if (index === -1) {
    selectedDocuments.value.push(id);
    return;
  }

  selectedDocuments.value.splice(index, 1);
}

function editUser(id: string): void {
  router.push({
    name: 'SecurityUsersUpdate',
    params: { id },
  });
}

// DELETE
// =========================================================================
async function onDeleteConfirmed(): Promise<void> {
  deleteModalIsLoading.value = true;
  loading.value = true;
  try {
    await wrapper().performDeleteUsers(props.index, props.collection, candidatesForDeletion.value);
    deleteModalIsLoading.value = false;
    deleteModalOpen.value = false;
    await fetchDocuments();
    if (authStore.adminAlreadyExists) {
      /* L'échec de `checkFirstAdmin` était rattrapé ici, puis passé à un
         `setError` qui n'existait pas : l'appel levait, et c'est le `catch`
         ci-dessous qui prenait la main. Il la prend désormais directement. */
      await authStore.checkFirstAdmin();
    }
  } catch (e) {
    logger.error(e);
    deleteModalIsLoading.value = false;
    toast.danger(
      'Ooops! Something went wrong while deleting the document(s).',
      'The complete error has been printed to the console.',
    );
  }
  loading.value = false;
}

function deleteUser(id: string): void {
  candidatesForDeletion.value.push(id);
  deleteModalOpen.value = true;
}

function deleteBulk(): void {
  candidatesForDeletion.value = candidatesForDeletion.value.concat(selectedDocuments.value);
  deleteModalOpen.value = true;
}

function resetCandidatesForDeletion(): void {
  candidatesForDeletion.value = [];
}
</script>
