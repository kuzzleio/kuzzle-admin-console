<template>
  <div class="RoleList">
    <slot v-if="!currentFilter.basic && totalDocuments === 0" name="emptySet" />
    <template v-else>
      <filters
        class="tw:mb-3"
        :current-filter="currentFilter.basic"
        @filters-updated="onFiltersUpdated"
        @reset="onFiltersUpdated"
      />
      <Card key="list">
        <CardContent>
          <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
            <Spinner size="lg" />
          </div>

          <NoSearchResult v-show="!documents.length" />

          <div
            v-if="documents.length"
            class="tw:mb-3 tw:flex tw:flex-wrap tw:items-center tw:gap-2"
          >
            <!--
              `data-cy="UserList-bulkDeleteBtn"` sur la liste des rôles : le
              `data-cy` a été copié depuis `Users/List.vue` à l'origine, et
              `roles.spec.js` s'y accroche. Le renommer est une reprise de spec,
              pas une reprise d'UI — hors de ce lot.
            -->
            <Button
              class="tw:flex-none"
              data-cy="UserList-bulkDeleteBtn"
              :disabled="!displayBulkDelete"
              variant="destructive"
              @click="deleteBulk"
            >
              <i class="fa fa-minus-circle" aria-hidden="true" />
              Delete selected
            </Button>

            <PerPageSelector
              class="tw:ml-auto"
              :current-page-size="paginationSize"
              :total-documents="totalDocuments"
              @change-page-size="changePaginationSize($event)"
            />
          </div>

          <ul class="RoleList-list tw:flex tw:list-none tw:flex-col tw:gap-2 tw:pl-0">
            <li
              v-for="document in documents"
              :key="document.id"
              class="tw:rounded-md tw:border tw:border-border tw:p-2"
              data-cy="RoleList-list"
            >
              <RoleItem
                :document="document"
                :is-checked="isChecked(document.id)"
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
        class="tw:mt-4"
        data-cy="RolesManagement-pagination"
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

import RoleItem from '../Roles/RoleItem.vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import * as filterManager from '@/services/filterManager';
import { useKuzzleStore } from '@/stores';

import ListPagination from '@/components/Common/ListPagination.vue';
import PerPageSelector from '@/components/Common/PerPageSelector.vue';
import NoSearchResult from '@/components/Security/Common/NoSearchResult.vue';
import DeleteModal from './DeleteModal.vue';
import Filters from './Filters.vue';

export default {
  name: 'RoleList',
  components: {
    Button,
    Card,
    CardContent,
    DeleteModal,
    Filters,
    ListPagination,
    NoSearchResult,
    PerPageSelector,
    RoleItem,
    Spinner,
  },
  props: {
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
      currentFilter: new filterManager.Filter(),
      currentPage: 1,
      deleteModalIsLoading: false,
      documentToDelete: null,
      documents: [],
      loading: false,
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
    paginationFrom() {
      return (this.currentPage - 1) * this.paginationSize || 0;
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.currentFilter = Object.assign(
          new filterManager.Filter(),
          filterManager.loadFromRoute(this.$route),
        );
      },
    },
    currentFilter() {
      this.fetchRoles();
    },
    currentPage() {
      this.fetchRoles();
    },
  },
  mounted() {
    this.currentFilter = Object.assign(
      new filterManager.Filter(),
      filterManager.loadFromRoute(this.$route),
    );
  },
  methods: {
    changePaginationSize(e) {
      this.paginationSize = e;
      this.fetchRoles();
    },
    // DELETE
    // =========================================================================
    async onDeleteConfirmed() {
      this.deleteModalIsLoading = true;
      try {
        await this.wrapper.performDeleteRoles(this.candidatesForDeletion);
        this.deleteModalOpen = false;
        this.deleteModalIsLoading = false;
        this.fetchRoles();
      } catch (e) {
        this.$log.error(e);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: 'Ooops! Something went wrong while deleting the document(s).',
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }
    },
    deleteRole(id) {
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
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1;
    },
    toggleSelectDocuments(id) {
      const index = this.selectedDocuments.indexOf(id);

      if (index === -1) {
        this.selectedDocuments.push(id);
        return;
      }

      this.selectedDocuments.splice(index, 1);
    },
    onFiltersUpdated(filter) {
      let newFilters;
      if (filter.controllers && filter.controllers.length) {
        newFilters = Object.assign(this.currentFilter, {
          active: filterManager.ACTIVE_BASIC,
          basic: filter,
          from: 0,
        });
      } else {
        newFilters = Object.assign(this.currentFilter, {
          active: filterManager.NO_ACTIVE,
          basic: null,
          from: 0,
        });
      }
      try {
        filterManager.saveToRouter(
          filterManager.stripDefaultValuesFromFilter(newFilters),
          this.$router,
        );
      } catch (error) {
        this.$log.error(error);
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while updating the search filters',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true,
        });
      }
    },
    fetchRoles() {
      const pagination = {
        from: this.paginationFrom,
        size: this.paginationSize,
      };
      const filter = {};
      if (
        this.currentFilter.active === filterManager.ACTIVE_BASIC &&
        this.currentFilter.basic.controllers &&
        this.currentFilter.basic.controllers.length
      ) {
        filter.controllers = this.currentFilter.basic.controllers;
      }
      this.wrapper
        .performSearchRoles(filter, pagination)
        .then((res) => {
          this.documents = res.documents;
          this.totalDocuments = res.total;
        })
        .catch((e) => {
          this.$log.error(e);
          this.$bvToast.toast('The complete error has been printed to console', {
            title: 'Ooops! Something went wrong while fetching the role list',
            variant: 'warning',
            toaster: 'b-toaster-bottom-right',
            appendToast: true,
            dismissible: true,
            noAutoHide: true,
          });
        });
    },
    editDocument(route, id) {
      this.$router.push({
        name: this.routeUpdate,
        params: { id },
      });
    },
    create() {
      this.$router.push({ name: this.routeCreate });
    },
  },
};
</script>
