<template>
  <div class="IndexesPage tw:mx-auto tw:w-full tw:max-w-6xl tw:px-4 tw:pb-12" data-cy="IndexesPage">
    <div class="tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-4">
      <headline>Indexes</headline>
      <Button
        v-if="canCreateIndex"
        class="tw:mt-3"
        data-cy="IndexesPage-createBtn"
        @click.prevent="openCreateModal"
      >
        <i class="fa fa-plus-circle" />
        Create an index
      </Button>
    </div>

    <list-not-allowed v-if="!canSearchIndex" />
    <template v-else>
      <div class="tw:mb-3 tw:flex tw:flex-wrap tw:items-center tw:gap-2">
        <span class="tw:flex-1 tw:text-sm tw:text-secondary">
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

        <div
          class="tw:flex tw:items-stretch tw:overflow-hidden tw:rounded-md tw:border tw:border-input"
        >
          <label
            class="tw:flex tw:items-center tw:bg-muted tw:px-3 tw:font-sans tw:text-sm tw:text-muted-foreground"
            for="indexes-filter"
            >Filter</label
          >
          <Input
            id="indexes-filter"
            v-model="filter"
            v-focus
            class="tw:rounded-none tw:border-0"
            data-cy="IndexesPage-filter"
            :disabled="indexes.length === 0"
            @keyup.enter="navigateToIndex"
          />
        </div>
      </div>

      <Table class="tw:border tw:border-border">
        <TableHeader>
          <TableRow>
            <TableHead class="tw:w-8" />
            <TableHead class="tw:w-10" />
            <TableHead :aria-sort="ariaSort('name')">
              <Button
                class="tw:px-1 tw:text-muted-foreground"
                data-cy="IndexesPage-sort--name"
                size="sm"
                variant="ghost"
                @click="toggleSort('name')"
              >
                Name
                <i :class="sortIcon('name')" />
              </Button>
            </TableHead>
            <TableHead :aria-sort="ariaSort('collections')" class="tw:w-40 tw:text-center">
              <Button
                class="tw:px-1 tw:text-muted-foreground"
                data-cy="IndexesPage-sort--collections"
                size="sm"
                variant="ghost"
                @click="toggleSort('collections')"
              >
                Collections
                <i :class="sortIcon('collections')" />
              </Button>
            </TableHead>
            <TableHead class="tw:w-56" />
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-if="rows.length === 0">
            <TableCell class="tw:py-6 tw:text-center" colspan="5">
              <template v-if="filtering">
                <h4 class="tw:text-secondary">There is no index matching your filter.</h4>
              </template>
              <template v-else>
                <h4 class="tw:text-secondary">There is no index.</h4>
                <p v-if="canCreateIndex" class="tw:text-secondary">
                  You can create one by hitting the button above.
                </p>
              </template>
            </TableCell>
          </TableRow>

          <TableRow v-for="index of rows" :key="index.name">
            <TableCell>
              <Checkbox
                :checked="isChecked(index)"
                :data-cy="`IndexesPage-checkbox--${index.name}`"
                @change="onCheckboxClick(index)"
              />
            </TableCell>
            <TableCell class="tw:text-secondary">
              <i class="fa fa-2x fa-database" />
            </TableCell>
            <TableCell class="code">
              <router-link
                class="tw:font-medium tw:text-foreground tw:hover:underline"
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
            <TableCell class="tw:text-center">
              {{ index.collectionsCount || '--' }}
            </TableCell>
            <TableCell class="tw:text-right">
              <Button
                as="router-link"
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
                as="router-link"
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

    <CreateIndexModal :open.sync="createIndexOpen" @create-successful="onCreateModalSuccess" />
    <DeleteIndexModal
      ref="deleteIndexModal"
      :index="indexToDelete"
      :open.sync="deleteIndexOpen"
      @confirm-deletion="onConfirmDeleteModal"
      @cancel="onCancelDeleteModal"
    />
    <BulkDeleteIndexesModal
      :indexes="selectedIndexes"
      :open.sync="bulkDeleteIndexesOpen"
      @delete-successful="onDeleteModalSuccess"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';

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
import Focus from '@/directives/focus.directive';
import { useAuthStore, useStorageIndexStore } from '@/stores';

import ListNotAllowed from '@/components/Common/ListNotAllowed.vue';
import Headline from '@/components/Materialize/Headline.vue';
import BulkDeleteIndexesModal from './BulkDeleteIndexesModal.vue';
import CreateIndexModal from './CreateIndexModal.vue';
import DeleteIndexModal from './DeleteIndexModal.vue';

export default {
  name: 'IndexesPage',
  components: {
    Headline,
    CreateIndexModal,
    DeleteIndexModal,
    BulkDeleteIndexesModal,
    ListNotAllowed,
    Button,
    Checkbox,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  },
  // `v-focus` plutôt que l'attribut `autofocus` : le navigateur ne l'honore
  // qu'au chargement du document, pas quand Vue insère l'élément plus tard.
  // `b-form-input` avait sa propre prop `autofocus`, qui appelait `focus()`
  // au montage (G-023).
  directives: {
    Focus,
  },
  setup() {
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

    return { storageIndexStore, filter, rows, filtering, toggleSort, ariaSort };
  },
  data() {
    return {
      bulkDeleteIndexesOpen: false,
      createIndexOpen: false,
      deleteIndexOpen: false,
      indexToDelete: null,
      selectedIndexes: [],
    };
  },
  computed: {
    ...mapState(useAuthStore, ['canSearchIndex', 'canCreateIndex']),
    ...mapState(useStorageIndexStore, ['indexes', 'loadingIndexes']),
    bulkDeleteEnabled() {
      return this.selectedIndexes.length > 0;
    },
    allChecked() {
      return this.selectedIndexes.length === this.rows.length;
    },
  },
  methods: {
    sortIcon(key) {
      const sort = this.ariaSort(key);

      if (sort === 'none') {
        return 'fa fa-sort tw:opacity-50';
      }

      return sort === 'ascending' ? 'fa fa-sort-up' : 'fa fa-sort-down';
    },
    openCreateModal() {
      this.createIndexOpen = true;
    },
    openDeleteModal(index) {
      this.indexToDelete = index;
      this.deleteIndexOpen = true;
    },
    openBulkDeleteModal() {
      this.bulkDeleteIndexesOpen = true;
    },
    async onCancelDeleteModal() {
      this.deleteIndexOpen = false;
      await this.refreshIndexes();
    },
    async onConfirmDeleteModal() {
      try {
        await this.storageIndexStore.deleteIndex(this.indexToDelete);
        this.deleteIndexOpen = false;
        await this.refreshIndexes();
      } catch (err) {
        this.$refs.deleteIndexModal.setError(err.message);
      }
    },
    async onDeleteModalSuccess() {
      await this.refreshIndexes();
    },
    async onCreateModalSuccess() {
      await this.refreshIndexes();
    },
    async refreshIndexes() {
      try {
        await this.storageIndexStore.fetchIndexList();
      } catch (err) {
        this.$log.error(err);
        this.$bvToast.toast('The complete error has been printed to the console.', {
          title: err.message,
          variant: 'danger',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
        });
      }
    },
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedIndexes = [];
        return;
      }
      this.selectedIndexes = [];
      this.selectedIndexes = this.rows;
    },
    isChecked(index) {
      return !!this.selectedIndexes.find((el) => el.name === index.name);
    },
    onCheckboxClick(index) {
      const indexAlreadySelected = this.selectedIndexes.find((el) => el.name === index.name);

      if (!indexAlreadySelected) {
        this.selectedIndexes.push(index);
        return;
      }

      this.selectedIndexes = this.selectedIndexes.filter((el) => el.name !== index.name);
    },
    navigateToIndex() {
      const index = this.rows[0];

      if (!index) {
        return;
      }

      const route = {
        name: 'Collections',
        params: { indexName: index.name },
      };

      this.$router.push(route);
    },
  },
};
</script>
