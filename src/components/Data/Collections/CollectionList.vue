<template>
  <div>
    <div
      v-if="index"
      class="CollectionList tw:mx-auto tw:w-full tw:max-w-6xl tw:px-4 tw:pb-12"
      data-cy="CollectionList"
    >
      <headline>
        <div class="tw:flex tw:flex-row">
          <span class="tw:flex-1 tw:truncate">
            <i class="fa fa-database tw:text-secondary" /> &nbsp;
            <span class="code">{{ indexName }}</span>
          </span>
          <span class="tw:flex tw:items-center tw:gap-2">
            <Button
              :as="canCreateCollection(indexName) && index ? 'router-link' : 'button'"
              data-cy="CollectionList-create"
              :disabled="!canCreateCollection(indexName) || !index"
              :title="
                !canCreateCollection(indexName)
                  ? `Your rights disallow you to create collections on index ${indexName}`
                  : ''
              "
              :to="
                canCreateCollection(indexName) && index
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

      <list-not-allowed v-if="!canSearchCollection(indexName)" />
      <div v-else-if="collections" class="CollectionList-content">
        <div class="tw:mb-3 tw:flex tw:flex-wrap tw:items-center tw:gap-2">
          <span class="tw:flex-1 tw:text-sm tw:text-secondary">
            {{ collections.length }}
            {{ collections.length === 1 ? 'collection' : 'collections' }}
          </span>

          <Button variant="outline" @click="onToggleAllClicked">
            <i :class="`far ${allChecked ? 'fa-check-square' : 'fa-square'}`" />
            Toggle all
          </Button>

          <Button
            v-if="currentEnvironment.backendMajorVersion !== 1"
            data-cy="CollectionList-bulkDelete--btn"
            :disabled="!bulkDeleteEnabled"
            variant="destructive"
            @click="deleteCollections"
          >
            <i class="fa fa-minus-circle" />
            Delete
          </Button>

          <div
            class="tw:flex tw:items-stretch tw:overflow-hidden tw:rounded-md tw:border tw:border-input"
          >
            <label
              class="tw:flex tw:items-center tw:bg-muted tw:px-3 tw:font-sans tw:text-sm tw:text-muted-foreground"
              for="collections-filter"
              >Filter</label
            >
            <Input
              id="collections-filter"
              v-model="filter"
              v-focus
              class="tw:rounded-none tw:border-0"
              data-cy="CollectionList-filter"
              :disabled="collections.length === 0"
              @keyup.enter="navigateToCollection"
            />
          </div>
        </div>

        <Table class="tw:border tw:border-border" data-cy="CollectionList-table">
          <TableHeader>
            <TableRow>
              <TableHead class="tw:w-8" />
              <TableHead class="tw:w-10" />
              <TableHead :aria-sort="ariaSort('name')">
                <Button
                  class="tw:px-1 tw:text-muted-foreground"
                  data-cy="CollectionList-sort--name"
                  size="sm"
                  variant="ghost"
                  @click="toggleSort('name')"
                >
                  Name
                  <i :class="sortIcon('name')" />
                </Button>
              </TableHead>
              <TableHead class="tw:w-56" />
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-if="rows.length === 0">
              <TableCell class="tw:py-6 tw:text-center" colspan="4">
                <template v-if="filtering">
                  <h4 class="tw:text-secondary">There is no collection matching your filter.</h4>
                </template>
                <template v-else>
                  <h4 class="tw:text-secondary">This index has no collections.</h4>
                  <p v-if="canCreateCollection(index.name)" class="tw:text-secondary">
                    You can create the collection by hitting the button above.
                  </p>
                </template>
              </TableCell>
            </TableRow>

            <TableRow v-for="collection of rows" :key="collection.name">
              <TableCell>
                <Checkbox
                  :checked="isChecked(collection)"
                  :data-cy="`CollectionList-checkbox--${collection.name}`"
                  @change="onCheckboxClick(collection)"
                />
              </TableCell>
              <TableCell class="tw:text-secondary">
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
                  class="tw:font-medium tw:text-foreground tw:hover:underline"
                  :data-cy="`CollectionList-name--${collection.name}`"
                  :title="collection.name"
                  :to="collectionRoute(collection)"
                  >{{ truncateName(collection.name) }}</router-link
                >
              </TableCell>
              <TableCell class="tw:text-right">
                <Button
                  as="router-link"
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
                  :as="canEditCollection(collection.name) ? 'router-link' : 'button'"
                  :data-cy="`CollectionList-edit--${collection.name}`"
                  :disabled="collection.type !== 'stored' || !canEditCollection(collection.name)"
                  size="icon"
                  title="Edit collection"
                  :to="
                    canEditCollection(collection.name)
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
                  v-if="currentEnvironment.backendMajorVersion !== 1 && !collection.isRealtime()"
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
        :index="index"
        :collection="collectionToDelete"
        :open.sync="deleteCollectionOpen"
        @delete-successful="onDeleteModalSuccess"
      />
      <BulkDeleteCollectionsModal
        :index="index"
        :collections="selectedCollections"
        :open.sync="bulkDeleteCollectionsOpen"
        @delete-successful="onDeleteModalSuccess"
      />
    </div>
    <DeleteIndexModal
      ref="deleteIndexModal"
      :index="index"
      :open.sync="deleteIndexOpen"
      @confirm-deletion="onDeleteIndexConfirm"
      @cancel="onDeleteIndexCancel"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';

import ListNotAllowed from '../../Common/ListNotAllowed.vue';
import Headline from '../../Materialize/Headline.vue';
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
import Focus from '@/directives/focus.directive';
import { useAuthStore, useKuzzleStore, useStorageIndexStore } from '@/stores';
import { truncateName } from '@/utils';

import BulkDeleteCollectionsModal from './BulkDeleteCollectionsModal.vue';
import DeleteCollectionModal from './DeleteCollectionModal.vue';

export default {
  name: 'CollectionList',
  components: {
    IndexDropdownAction,
    DeleteIndexModal,
    DeleteCollectionModal,
    BulkDeleteCollectionsModal,
    Headline,
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
  props: {
    indexName: String,
  },
  setup(props) {
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

    return { kuzzleStore, storageIndexStore, filter, rows, filtering, toggleSort, ariaSort };
  },
  data() {
    return {
      bulkDeleteCollectionsOpen: false,
      deleteCollectionOpen: false,
      deleteIndexOpen: false,
      collectionToDelete: null,
      selectedCollections: [],
    };
  },
  computed: {
    ...mapState(useKuzzleStore, ['$kuzzle']),
    ...mapState(useAuthStore, ['canSearchCollection', 'canCreateCollection', 'canEditCollection']),
    index() {
      return this.storageIndexStore.getOneIndex(this.indexName);
    },
    collections() {
      return this.index ? this.index.collections : [];
    },
    bulkDeleteEnabled() {
      return this.selectedCollections.length > 0;
    },
    allChecked() {
      return this.selectedCollections.length === this.rows.length;
    },
    currentEnvironment() {
      return this.kuzzleStore.currentEnvironment;
    },
  },
  methods: {
    truncateName,
    sortIcon(key) {
      const sort = this.ariaSort(key);

      if (sort === 'none') {
        return 'fa fa-sort tw:opacity-50';
      }

      return sort === 'ascending' ? 'fa fa-sort-up' : 'fa fa-sort-down';
    },
    collectionRoute(collection) {
      return {
        name: collection.type === 'realtime' ? 'WatchCollection' : 'DocumentList',
        params: {
          indexName: this.indexName,
          collectionName: collection.name,
        },
      };
    },
    onDeleteIndexCancel() {
      this.deleteIndexOpen = false;
    },
    async onDeleteIndexConfirm() {
      try {
        await this.storageIndexStore.deleteIndex(this.index);
        this.deleteIndexOpen = false;
        this.$router.push({ name: 'Indexes', params: {} });
      } catch (err) {
        this.$refs.deleteIndexModal.setError(err.message);
      }
    },
    onDeleteIndexClicked() {
      this.deleteIndexOpen = true;
    },
    onDeleteCollectionClicked(collection) {
      this.collectionToDelete = collection;
      this.deleteCollectionOpen = true;
    },
    deleteCollections() {
      this.bulkDeleteCollectionsOpen = true;
    },
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedCollections = [];
        return;
      }

      this.selectedCollections = [];
      this.selectedCollections = this.rows;
    },
    isChecked(collection) {
      return !!this.selectedCollections.find((el) => el.name === collection.name);
    },
    onCheckboxClick(collection) {
      const collectionAlreadySelected = this.selectedCollections.find(
        (el) => el.name === collection.name,
      );

      if (!collectionAlreadySelected) {
        this.selectedCollections.push(collection);
        return;
      }

      this.selectedCollections = this.selectedCollections.filter(
        (el) => el.name !== collection.name,
      );
    },
    onDeleteModalSuccess() {
      this.selectedCollections = [];
    },
    navigateToCollection() {
      const collection = this.rows[0];

      if (!collection) {
        return;
      }

      this.$router.push(this.collectionRoute(collection));
    },
  },
};
</script>
