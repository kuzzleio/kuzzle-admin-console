<template>
  <div class="UserList">
    <slot v-if="isCollectionEmpty && !loading" name="emptySet" />
    <template v-else>
      <filters
        class="mb-3"
        :available-operands="searchFilterOperands"
        :current-filter="currentFilter"
        :mapping-attributes="mappingAttributes"
        :index="index"
        :collection="collection"
        @filters-updated="onFiltersUpdated"
      />

      <div v-if="loading" class="flex justify-center py-8">
        <Spinner size="lg" />
      </div>

      <template v-else>
        <Card v-if="!isCollectionEmpty" key="list">
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
                  :index="index"
                  :collection="collection"
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

      <delete-modal
        v-model:open="deleteModalOpen"
        :candidates-for-deletion="candidatesForDeletion"
        :is-loading="deleteModalIsLoading"
        @confirm="onDeleteConfirmed"
        @hide="resetCandidatesForDeletion"
      />
    </template>
  </div>
</template>

<script>
import { mapState } from 'pinia';

import Filters from '../../Common/Filters/Filters.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import * as filterManager from '@/services/filterManager';
import { useAuthStore, useKuzzleStore } from '@/stores';

import ListPagination from '@/components/Common/ListPagination.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NoSearchResult from '@/components/Security/Common/NoSearchResult.vue';
import DeleteModal from './DeleteModal.vue';
import UserItem from './UserItem.vue';

export default {
  name: 'UserList',
  components: {
    Button,
    Card,
    CardContent,
    DeleteModal,
    Filters,
    ListPagination,
    NoSearchResult,
    PerPageSelector,
    Spinner,
    UserItem,
  },
  props: {
    index: String,
    collection: String,
    itemName: String,
    displayCreate: {
      type: Boolean,
      default: false,
    },
    mappingAttributes: {
      type: Object,
      required: true,
    },
    performSearch: Function,
    performDelete: Function,
    routeCreate: String,
    routeUpdate: String,
  },
  setup() {
    return {
      authStore: useAuthStore(),
    };
  },
  data() {
    return {
      deleteModalOpen: false,
      currentFilter: new filterManager.Filter(),
      currentPage: 1,
      deleteModalIsLoading: false,
      documents: [],
      loading: true,
      searchFilterOperands: filterManager.searchFilterOperands,
      selectedDocuments: [],
      totalDocuments: 0,
      candidatesForDeletion: [],
      paginationSize: 25,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
    isDocumentListFiltered() {
      return this.currentFilter.active !== filterManager.NO_ACTIVE;
    },
    isCollectionEmpty() {
      return !this.isDocumentListFiltered && this.totalDocuments === 0;
    },
    displayBulkDelete() {
      return this.selectedDocuments.length > 0;
    },
    allChecked() {
      if (!this.selectedDocuments || !this.documents) {
        return false;
      }

      return this.selectedDocuments.length === this.documents.length;
    },
    paginationFrom() {
      return parseInt(this.currentFilter.from) || 0;
    },
  },
  watch: {
    $route: {
      immediate: false,
      handler(newValue) {
        this.currentFilter = filterManager.load(this.index, this.collection, newValue);
        filterManager.save(this.currentFilter, this.$router, this.index, this.collection);
      },
    },
    currentFilter() {
      this.fetchDocuments();
    },
    currentPage: {
      handler(value) {
        const from = (value - 1) * this.paginationSize;
        this.onFiltersUpdated(
          Object.assign(this.currentFilter, {
            from,
          }),
        );
      },
    },
  },
  mounted() {
    this.currentFilter = filterManager.load(this.index, this.collection, this.$route);
    filterManager.save(this.currentFilter, this.$router, this.index, this.collection);
  },
  methods: {
    changePaginationSize(e) {
      this.paginationSize = e;
      this.fetchDocuments();
    },
    isChecked(id) {
      return this.selectedDocuments.includes(id);
    },
    toggleAll() {
      if (this.allChecked) {
        this.selectedDocuments = [];
        return;
      }
      this.selectedDocuments = this.documents.map((document) => document.id);
    },
    toggleSelectDocuments(id) {
      const index = this.selectedDocuments.indexOf(id);

      if (index === -1) {
        this.selectedDocuments.push(id);
        return;
      }

      this.selectedDocuments.splice(index, 1);
    },
    onFiltersUpdated(newFilters, loadedFromHistory) {
      this.currentFilter = newFilters;
      try {
        filterManager.save(newFilters, this.$router, this.index, this.collection);
        if (!loadedFromHistory) {
          filterManager.addNewHistoryItemAndSave(newFilters, this.index, this.collection);
        }
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while updating the filters',
          'The complete error has been printed to console',
        );
      }
    },
    async fetchDocuments() {
      this.loading = true;
      this.$forceUpdate();

      this.selectedDocuments = [];

      const pagination = {
        from: this.paginationFrom,
        size: this.paginationSize,
      };

      let searchQuery = filterManager.toSearchQuery(
        this.currentFilter,
        this.mappingAttributes,
        this.wrapper,
      );
      if (!searchQuery) {
        searchQuery = {};
      }

      const sorting = filterManager.toSort(this.currentFilter);

      // TODO: refactor how search is done
      // Execute search with corresponding searchQuery
      try {
        const res = await this.wrapper.performSearchUsers(
          this.collection,
          this.index,
          searchQuery,
          pagination,
          sorting,
        );
        this.documents = res.documents;
        this.totalDocuments = res.total;
        if (res.documents.length === 0 && res.total !== 0) {
          this.onFiltersUpdated(
            Object.assign(this.currentFilter, {
              from: 0,
            }),
          );
          return;
        }
      } catch (error) {
        this.$log.error(error);
        this.$log.debug(error.stack);
        this.$toast.warning(
          'Ooops! Something went wrong while fetching users.',
          'The complete error has been printed to console',
        );
      }
      this.loading = false;
    },
    editUser(id) {
      this.$router.push({
        name: 'SecurityUsersUpdate',
        params: { id },
      });
    },

    // DELETE
    // =========================================================================
    async onDeleteConfirmed() {
      this.deleteModalIsLoading = true;
      this.loading = true;
      try {
        await this.wrapper.performDeleteUsers(
          this.index,
          this.collection,
          this.candidatesForDeletion,
        );
        this.deleteModalIsLoading = false;
        this.deleteModalOpen = false;
        await this.fetchDocuments();
        if (this.authStore.adminAlreadyExists) {
          try {
            await this.authStore.checkFirstAdmin();
          } catch (err) {
            this.$log.error(err);
            this.setError(err.message);
          }
        }
      } catch (e) {
        this.$log.error(e);
        this.deleteModalIsLoading = false;
        this.$toast.danger(
          'Ooops! Something went wrong while deleting the document(s).',
          'The complete error has been printed to the console.',
        );
      }
      this.loading = false;
    },
    deleteUser(id) {
      this.candidatesForDeletion.push(id);
      this.deleteModalOpen = true;
    },
    deleteBulk() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(this.selectedDocuments);
      this.deleteModalOpen = true;
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion = [];
    },
    create() {
      this.$router.push({ name: this.routeCreate });
    },
  },
};
</script>
