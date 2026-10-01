<template>
  <div class="ProfileList">
    <Filters :current-filter="currentFilter" @filters-updated="onFiltersUpdated" />
    <Card key="list" class="mt-3 shadow-signature">
      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <Spinner size="lg" />
        </div>

        <NoSearchResult v-show="!documents.length" />

        <div v-if="documents.length" class="mb-3 flex flex-wrap items-center gap-2">
          <Button data-cy="ProfileList-toggleAllBtn" variant="outline" @click="toggleAll">
            <i :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`" aria-hidden="true" />
            Toggle all
          </Button>

          <Button
            data-cy="ProfileList-bulkDeleteBtn"
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
          class="ProfileList-list flex list-none flex-col gap-2 pl-0"
          data-cy="ProfileList-items"
        >
          <li
            v-for="document in documents"
            :key="document._id"
            class="rounded-md border border-border p-2"
            data-cy="ProfileList-item"
          >
            <ProfileItem
              :document="document"
              :is-checked="isChecked(document._id)"
              @checkbox-click="toggleSelectDocuments"
              @edit="editProfile(document._id)"
              @delete="deleteProfile"
            />
          </li>
        </ul>
      </CardContent>
    </Card>

    <ListPagination
      v-show="totalDocuments > paginationSize"
      v-model:page="currentPage"
      class="mt-4"
      data-cy="ProfileManagement-pagination"
      :items-per-page="paginationSize"
      :total="totalDocuments"
    />
    <DeleteModal
      v-model:open="deleteModalOpen"
      :candidates-for-deletion="candidatesForDeletion"
      :is-loading="deleteModalIsLoading"
      @confirm="onDeleteConfirmed"
      @hide="resetCandidatesForDeletion"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import { useKuzzleStore } from '@/stores';
import type { ProfileDocument } from './types';

import ListPagination from '@/components/Common/ListPagination.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NoSearchResult from '@/components/Security/Common/NoSearchResult.vue';
import DeleteModal from './DeleteModal.vue';
import Filters from './Filters.vue';
import ProfileItem from './ProfileItem.vue';

const props = withDefaults(
  defineProps<{
    collection?: string;
    displayCreate?: boolean;
    index?: string;
    itemName?: string;
    routeCreate?: string;
    routeUpdate?: string;
  }>(),
  {
    collection: undefined,
    displayCreate: false,
    index: undefined,
    itemName: undefined,
    routeCreate: undefined,
    routeUpdate: undefined,
  },
);

const kuzzleStore = useKuzzleStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const deleteModalOpen = ref(false);
const candidatesForDeletion = ref<string[]>([]);
/* Les rôles cherchés. */
const currentFilter = ref<string[]>([]);
const currentPage = ref(1);
const deleteModalIsLoading = ref(false);
const documents = ref<ProfileDocument[]>([]);
const loading = ref(true);
const selectedDocuments = ref<string[]>([]);
const totalDocuments = ref(0);
const paginationSize = ref(25);

const displayBulkDelete = computed(() => selectedDocuments.value.length > 0);
const allChecked = computed(() => selectedDocuments.value.length === documents.value.length);
const paginationFrom = computed(() => (currentPage.value - 1) * paginationSize.value || 0);

function wrapper() {
  const kuzzleWrapper = kuzzleStore.wrapper;
  if (!kuzzleWrapper) {
    throw new Error('No Kuzzle wrapper set for the current environment');
  }
  return kuzzleWrapper;
}

function loadFilterFromRoute(): void {
  const filter = route.query.filter;
  if (filter && Array.isArray(filter)) {
    currentFilter.value = filter.filter((role): role is string => role !== null);
  }
}

async function fetchProfiles(): Promise<void> {
  loading.value = true;
  const pagination = {
    from: paginationFrom.value,
    size: paginationSize.value,
  };

  try {
    const res = await wrapper().performSearchProfiles({ roles: currentFilter.value }, pagination);
    documents.value = res.documents;
    totalDocuments.value = res.total;
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while fetching the profiles',
      'The complete error has been printed to console',
    );
  }
  loading.value = false;
}

watch(() => route.fullPath, loadFilterFromRoute, { immediate: true });
watch(currentFilter, fetchProfiles, { immediate: true });
watch(currentPage, () => {
  router.push({ query: { from: paginationFrom.value } });
  fetchProfiles();
});

function changePaginationSize(size: number): void {
  paginationSize.value = size;
  fetchProfiles();
}

function isChecked(id: string): boolean {
  return selectedDocuments.value.indexOf(id) > -1;
}

function toggleAll(): void {
  if (allChecked.value) {
    selectedDocuments.value = [];
    return;
  }
  selectedDocuments.value = documents.value.map((document) => document._id);
}

function toggleSelectDocuments(id: string): void {
  const index = selectedDocuments.value.indexOf(id);

  if (index === -1) {
    selectedDocuments.value.push(id);
    return;
  }

  selectedDocuments.value.splice(index, 1);
}

function saveFilterToRoute(newFilter: string[]): void {
  router.push({
    query: { filter: newFilter, from: paginationFrom.value },
  });
}

function onFiltersUpdated(newFilters: string[]): void {
  try {
    saveFilterToRoute(newFilters);
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while updating filters',
      'The complete error has been printed to console',
    );
  }
}

function editProfile(id: string): void {
  router.push({
    name: 'SecurityProfilesUpdate',
    params: { id },
  });
}

// DELETE
// =========================================================================
async function onDeleteConfirmed(): Promise<void> {
  deleteModalIsLoading.value = true;
  try {
    await wrapper().performDeleteProfiles(
      props.index,
      props.collection,
      candidatesForDeletion.value,
    );

    selectedDocuments.value = [];
    fetchProfiles();
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while deleting the profiles',
      'The complete error has been printed to console',
    );
  }
  deleteModalOpen.value = false;
  deleteModalIsLoading.value = false;
}

function deleteBulk(): void {
  candidatesForDeletion.value = candidatesForDeletion.value.concat(selectedDocuments.value);
  deleteModalOpen.value = true;
}

function deleteProfile(id: string): void {
  candidatesForDeletion.value.push(id);
  deleteModalOpen.value = true;
}

function resetCandidatesForDeletion(): void {
  candidatesForDeletion.value = [];
}
</script>
