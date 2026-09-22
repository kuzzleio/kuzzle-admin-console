<template>
  <div class="ProfileList">
    <slot v-if="currentFilter.basic && totalDocuments === 0" name="emptySet" />
    <template v-else>
      <filters
        :current-filter="currentFilter"
        :index="index"
        :collection="collection"
        @filters-updated="onFiltersUpdated"
      />
      <Card key="list" class="mt-3">
        <CardContent>
          <div v-if="loading" class="flex justify-center py-8">
            <Spinner size="lg" />
          </div>

          <NoSearchResult v-show="!documents.length" />

          <div v-if="documents.length" class="mb-3 flex flex-wrap items-center gap-2">
            <Button data-cy="ProfileList-toggleAllBtn" variant="outline" @click="toggleAll">
              <i
                :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`"
                aria-hidden="true"
              />
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
                :index="index"
                :collection="collection"
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
        class="mt-4"
        data-cy="ProfileManagement-pagination"
        :items-per-page="paginationSize"
        :page.sync="currentPage"
        :total="totalDocuments"
      />
    </template>
    <delete-modal
      :open.sync="deleteModalOpen"
      :candidates-for-deletion="candidatesForDeletion"
      :is-loading="deleteModalIsLoading"
      @confirm="onDeleteConfirmed"
      @hide="resetCandidatesForDeletion"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';

import ProfileItem from '../Profiles/ProfileItem.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useKuzzleStore } from '@/stores';

import ListPagination from '@/components/Common/ListPagination.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NoSearchResult from '@/components/Security/Common/NoSearchResult.vue';
import DeleteModal from './DeleteModal.vue';
import Filters from './Filters.vue';

export default {
  name: 'ProfileList',
  components: {
    Button,
    Card,
    CardContent,
    DeleteModal,
    Filters,
    ListPagination,
    NoSearchResult,
    PerPageSelector,
    ProfileItem,
    Spinner,
  },
  props: {
    index: String,
    collection: String,
    itemName: String,
    displayCreate: {
      type: Boolean,
      default: false,
    },
    routeCreate: String,
    routeUpdate: String,
  },
  data() {
    return {
      deleteModalOpen: false,
      candidatesForDeletion: [],
      currentFilter: [],
      currentPage: 1,
      deleteModalIsLoading: false,
      documents: [],
      loading: true,
      selectedDocuments: [],
      totalDocuments: 0,
      paginationSize: 25,
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['wrapper']),
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
      return (this.currentPage - 1) * this.paginationSize || 0;
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.loadFilterFromRoute();
      },
    },
    currentFilter: {
      immediate: true,
      handler() {
        this.fetchProfiles();
      },
    },
    currentPage() {
      this.$router.push({ query: { from: this.paginationFrom } });
      this.fetchProfiles();
    },
  },
  methods: {
    changePaginationSize(e) {
      this.paginationSize = e;
      this.fetchProfiles();
    },
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1;
    },
    toggleAll() {
      if (this.allChecked) {
        this.selectedDocuments = [];
        return;
      }
      this.selectedDocuments = [];
      this.selectedDocuments = this.documents.map((document) => document._id);
    },
    toggleSelectDocuments(id) {
      const index = this.selectedDocuments.indexOf(id);

      if (index === -1) {
        this.selectedDocuments.push(id);
        return;
      }

      this.selectedDocuments.splice(index, 1);
    },
    onFiltersUpdated(newFilters) {
      try {
        this.saveFilterToRoute(newFilters);
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while updating filters',
          'The complete error has been printed to console',
        );
      }
    },
    async fetchProfiles() {
      this.loading = true;
      const pagination = {
        from: this.paginationFrom,
        size: this.paginationSize,
      };

      try {
        const res = await this.wrapper.performSearchProfiles(
          { roles: this.currentFilter } || {},
          pagination,
        );
        this.documents = res.documents;
        this.totalDocuments = res.total;
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while fetching the profiles',
          'The complete error has been printed to console',
        );
      }
      this.loading = false;
    },
    editProfile(id) {
      this.$router.push({
        name: 'SecurityProfilesUpdate',
        params: { id },
      });
    },

    // DELETE
    // =========================================================================
    async onDeleteConfirmed() {
      this.deleteModalIsLoading = true;
      try {
        await this.wrapper.performDeleteProfiles(
          this.index,
          this.collection,
          this.candidatesForDeletion,
        );

        this.selectedDocuments = [];
        this.fetchProfiles();
      } catch (error) {
        this.$log.error(error);
        this.$toast.warning(
          'Ooops! Something went wrong while deleting the profiles',
          'The complete error has been printed to console',
        );
      }
      this.deleteModalOpen = false;
      this.deleteModalIsLoading = false;
    },
    deleteBulk() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(this.selectedDocuments);
      this.deleteModalOpen = true;
    },
    deleteProfile(id) {
      this.candidatesForDeletion.push(id);
      this.deleteModalOpen = true;
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion = [];
    },

    create() {
      this.$router.push({ name: this.routeCreate });
    },
    loadFilterFromRoute() {
      const filter = this.$route.query.filter;
      if (filter && Array.isArray(filter)) {
        this.currentFilter = filter;
      }
    },
    saveFilterToRoute(newFilter) {
      this.$router.push({
        query: { filter: newFilter, from: this.paginationFrom },
      });
    },
  },
};
</script>
