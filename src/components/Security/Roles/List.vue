<template>
  <div class="RoleList">
    <slot v-if="!currentFilter.basic && totalDocuments === 0" name="emptySet" />
    <template v-else>
      <Filters
        class="mb-3"
        :current-filter="currentFilter.basic"
        @filters-updated="onFiltersUpdated"
      />
      <Card key="list" class="shadow-signature">
        <CardContent>
          <div v-if="loading" class="flex justify-center py-8">
            <Spinner size="lg" />
          </div>

          <NoSearchResult v-show="!documents.length" />

          <div v-if="documents.length" class="mb-3 flex flex-wrap items-center gap-2">
            <!--
              `data-cy="UserList-bulkDeleteBtn"` sur la liste des rôles : le
              `data-cy` a été copié depuis `Users/List.vue` à l'origine, et
              `roles.spec.js` s'y accroche. Le renommer est une reprise de spec,
              pas une reprise d'UI — hors de ce lot.
            -->
            <Button
              class="flex-none"
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

          <ul class="RoleList-list flex list-none flex-col gap-2 pl-0">
            <li
              v-for="document in documents"
              :key="document._id"
              class="rounded-md border border-border p-2"
              data-cy="RoleList-list"
            >
              <RoleItem
                :document="document"
                :is-checked="isChecked(document._id)"
                @checkbox-click="toggleSelectDocuments"
                @common-list::edit-document="editDocument"
                @delete-document="deleteRole"
              />
            </li>
          </ul>
        </CardContent>
      </Card>

      <ListPagination
        v-show="totalDocuments > paginationSize"
        v-model:page="currentPage"
        class="mt-4"
        data-cy="RolesManagement-pagination"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/composables/useToast';
import { logger } from '@/lib/logger';
import * as filterManager from '@/services/filterManager';
import { useKuzzleStore } from '@/stores';
import type { RoleDocument, RoleFilter } from './types';

import ListPagination from '@/components/Common/ListPagination.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NoSearchResult from '@/components/Security/Common/NoSearchResult.vue';
import DeleteModal from './DeleteModal.vue';
import Filters from './Filters.vue';
import RoleItem from './RoleItem.vue';

const props = withDefaults(
  defineProps<{
    displayCreate?: boolean;
    routeCreate?: string;
    routeUpdate?: string;
  }>(),
  { displayCreate: false, routeCreate: undefined, routeUpdate: undefined },
);

const kuzzleStore = useKuzzleStore();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const deleteModalOpen = ref(false);
const candidatesForDeletion = ref<string[]>([]);
const currentFilter = ref<filterManager.Filter<RoleFilter>>(new filterManager.Filter());
const currentPage = ref(1);
const deleteModalIsLoading = ref(false);
const documents = ref<RoleDocument[]>([]);
const loading = ref(false);
const selectedDocuments = ref<string[]>([]);
const totalDocuments = ref(0);
const paginationSize = ref(25);

const displayBulkDelete = computed(() => selectedDocuments.value.length > 0);
const paginationFrom = computed(() => (currentPage.value - 1) * paginationSize.value || 0);

function loadFilterFromRoute(): void {
  currentFilter.value = Object.assign(
    new filterManager.Filter<RoleFilter>(),
    filterManager.loadFromRoute(route),
  );
}

function fetchRoles(): void {
  const pagination = {
    from: paginationFrom.value,
    size: paginationSize.value,
  };
  const filter: RoleFilter = {};
  if (
    currentFilter.value.active === filterManager.ACTIVE_BASIC &&
    currentFilter.value.basic?.controllers &&
    currentFilter.value.basic.controllers.length
  ) {
    filter.controllers = currentFilter.value.basic.controllers;
  }
  const wrapper = kuzzleStore.wrapper;
  if (!wrapper) {
    return;
  }
  wrapper
    .performSearchRoles(filter, pagination)
    .then((res: { documents: RoleDocument[]; total: number }) => {
      documents.value = res.documents;
      totalDocuments.value = res.total;
    })
    .catch((e: unknown) => {
      logger.error(e);
      toast.warning(
        'Ooops! Something went wrong while fetching the role list',
        'The complete error has been printed to console',
      );
    });
}

watch(() => route.fullPath, loadFilterFromRoute, { immediate: true });
watch(currentFilter, fetchRoles);
watch(currentPage, fetchRoles);

onMounted(loadFilterFromRoute);

function changePaginationSize(size: number): void {
  paginationSize.value = size;
  fetchRoles();
}

// DELETE
// =========================================================================
async function onDeleteConfirmed(): Promise<void> {
  deleteModalIsLoading.value = true;
  try {
    const wrapper = kuzzleStore.wrapper;
    if (!wrapper) {
      throw new Error('No Kuzzle wrapper set for the current environment');
    }
    await wrapper.performDeleteRoles(candidatesForDeletion.value);
    // Un rôle supprimé sort de la sélection (G-113).
    selectedDocuments.value = selectedDocuments.value.filter(
      (id) => !candidatesForDeletion.value.includes(id),
    );
    deleteModalOpen.value = false;
    deleteModalIsLoading.value = false;
    fetchRoles();
  } catch (e) {
    logger.error(e);
    toast.danger(
      'Ooops! Something went wrong while deleting the document(s).',
      'The complete error has been printed to the console.',
    );
  }
}

function deleteRole(id: string): void {
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

function isChecked(id: string): boolean {
  return selectedDocuments.value.indexOf(id) > -1;
}

function toggleSelectDocuments(id: string): void {
  const index = selectedDocuments.value.indexOf(id);

  if (index === -1) {
    selectedDocuments.value.push(id);
    return;
  }

  selectedDocuments.value.splice(index, 1);
}

function onFiltersUpdated(filter: RoleFilter): void {
  let newFilters;
  if (filter.controllers && filter.controllers.length) {
    newFilters = Object.assign(currentFilter.value, {
      active: filterManager.ACTIVE_BASIC,
      basic: filter,
      from: 0,
    });
  } else {
    newFilters = Object.assign(currentFilter.value, {
      active: filterManager.NO_ACTIVE,
      basic: null,
      from: 0,
    });
  }
  try {
    filterManager.saveToRouter(filterManager.stripDefaultValuesFromFilter(newFilters), router);
  } catch (error) {
    logger.error(error);
    toast.warning(
      'Ooops! Something went wrong while updating the search filters',
      'The complete error has been printed to console',
    );
  }
}

function editDocument(_route: string, id: string): void {
  router.push({
    name: props.routeUpdate,
    params: { id },
  });
}
</script>
