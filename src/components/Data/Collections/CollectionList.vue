<template>
  <div>
    <b-container v-if="index" class="CollectionList">
      <headline>
        <div class="d-flex flex-row">
          <span class="flex-grow-1 text-truncate">
            <i class="fa fa-database text-secondary" /> &nbsp;
            <span class="code">{{ indexName }}</span>
          </span>
          <span class="text-right">
            <b-button
              class="align-middle"
              data-cy="CollectionList-create"
              variant="primary"
              :disabled="!canCreateCollection(indexName) || !index"
              :title="
                !canCreateCollection(indexName)
                  ? `Your rights disallow you to create collections on index ${indexName}`
                  : ''
              "
              :to="{ name: 'CreateCollection', params: { indexName } }"
            >
              <i class="fa fa-plus" /> Create a collection
            </b-button>
            <IndexDropdownAction
              :index-name="indexName"
              @delete-index-clicked="onDeleteIndexClicked"
            />
          </span>
        </div>
      </headline>

      <list-not-allowed v-if="!canSearchCollection(indexName)" />
      <div v-else-if="collections" class="CollectionList-content">
        <template>
          <b-row class="mb-3">
            <b-col sm="2" class="text-secondary">
              {{ collections.length }}
              {{ collections.length === 1 ? 'collection' : 'collections' }}
            </b-col>
            <b-col sm="10">
              <b-row>
                <b-col cols="6" class="text-right">
                  <b-button variant="outline-dark" class="mr-2" @click="onToggleAllClicked">
                    <i
                      :class="`far ${
                        selectedCollections.length === filteredCollections.length
                          ? 'fa-check-square'
                          : 'fa-square'
                      } left`"
                    />
                    Toggle all
                  </b-button>

                  <b-button
                    v-if="currentEnvironment.backendMajorVersion !== 1"
                    variant="outline-danger"
                    :data-cy="`CollectionList-bulkDelete--btn`"
                    :disabled="!bulkDeleteEnabled"
                    @click="deleteCollections"
                  >
                    <i class="fa fa-minus-circle left" />
                    Delete
                  </b-button>
                </b-col>
                <b-col cols="6">
                  <b-input-group>
                    <template #prepend>
                      <b-input-group-text>Filter</b-input-group-text>
                    </template>
                    <b-form-input
                      v-model="filter"
                      autofocus
                      debounce="300"
                      :disabled="collections.length === 0"
                      @keyup.enter="navigateToCollection"
                    />
                  </b-input-group>
                </b-col>
              </b-row>
            </b-col>
          </b-row>

          <b-table
            striped
            outlined
            show-empty
            data-cy="CollectionList-table"
            :items="collections"
            :fields="tableFields"
            :filter="filter"
            @filtered="updateFilteredCollections"
          >
            <template #empty>
              <h4 class="text-secondary text-center">This index has no collections.</h4>
              <p v-if="canCreateCollection(index.name)" class="text-secondary text-center">
                You can create the collection by hitting the button above.
              </p>
            </template>
            <template #emptyfiltered>
              <h4 class="text-secondary text-center">
                There is no collection matching your filter.
              </h4>
            </template>
            <template #cell(selected)="row">
              <b-form-checkbox
                class="d-inline-block align-middle"
                type="checkbox"
                unchecked-value="false"
                value="true"
                :data-cy="`CollectionList-checkbox--${row.item.name}`"
                :checked="isChecked(row.item)"
                @change="onCheckboxClick(row.item)"
              />
            </template>
            <template #cell(type)="row">
              <i
                class="fa fa-2x"
                :class="{
                  'fa-bolt ml-2': row.item.type === 'realtime',
                  'fa-th-list': row.item.type === 'stored',
                }"
                :title="row.item.type === 'realtime' ? 'Realtime' : 'Stored'"
              />
            </template>
            <template #cell(name)="row">
              <b-link
                class="code"
                :data-cy="`CollectionList-name--${row.item.name}`"
                :title="row.item.name"
                :to="
                  row.item.type === 'realtime'
                    ? {
                        name: 'WatchCollection',
                        params: {
                          indexName: indexName,
                          collectionName: row.item.name,
                        },
                      }
                    : {
                        name: 'DocumentList',
                        params: {
                          indexName: indexName,
                          collectionName: row.item.name,
                        },
                      }
                "
                >{{ truncateName(row.item.name) }}</b-link
              >
            </template>
            <template #cell(count)="row">
              {{ row.item.count }}
            </template>
            <template #cell(actions)="row">
              <b-button
                class="mx-1"
                variant="link"
                title="Browse contents"
                :to="
                  row.item.type === 'realtime'
                    ? {
                        name: 'WatchCollection',
                        params: {
                          indexName: indexName,
                          collectionName: row.item.name,
                        },
                      }
                    : {
                        name: 'DocumentList',
                        params: {
                          indexName: indexName,
                          collectionName: row.item.name,
                        },
                      }
                "
                ><i class="fa fa-eye"
              /></b-button>
              <b-button
                class="mx-1"
                variant="link"
                title="Edit collection"
                :data-cy="`CollectionList-edit--${row.item.name}`"
                :disabled="row.item.type !== 'stored' || !canEditCollection(row.item.name)"
                :to="
                  canEditCollection(row.item.name)
                    ? {
                        name: 'EditCollection',
                        params: {
                          indexName: indexName,
                          collectionName: row.item.name,
                        },
                      }
                    : ''
                "
                ><i class="fa fa-pencil-alt"
              /></b-button>
              <b-button
                v-if="currentEnvironment.backendMajorVersion !== 1 && !row.item.isRealtime()"
                class="mx-1"
                variant="link"
                title="Delete collection"
                :data-cy="`CollectionList-delete--${row.item.name}`"
                @click="onDeleteCollectionClicked(row.item)"
                ><i class="fa fa-trash"
              /></b-button>
            </template>
          </b-table>
        </template>
      </div>
      <DeleteCollectionModal
        :index="index"
        :collection="collectionToDelete"
        :modal-id="deleteCollectionModalId"
        @delete-successful="onDeleteModalSuccess"
      />
      <BulkDeleteCollectionsModal
        :index="index"
        :collections="selectedCollections"
        :modal-id="bulkDeleteCollectionsModalId"
        @delete-successful="onDeleteModalSuccess"
      />
    </b-container>
    <DeleteIndexModal
      :ref="deleteIndexModalId"
      :index="index"
      :modal-id="deleteIndexModalId"
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
  },
  props: {
    indexName: String,
  },
  setup() {
    return {
      kuzzleStore: useKuzzleStore(),
      storageIndexStore: useStorageIndexStore(),
    };
  },
  data() {
    return {
      deleteCollectionModalId: 'deleteCollectionModal',
      bulkDeleteCollectionsModalId: 'bulkDeleteCollectionsModal',
      filter: '',
      collectionToDelete: null,
      deleteConfirmation: '',
      rawStoredCollections: [],
      filteredCollections: [],
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
      if (!this.selectedCollections || !this.filteredCollections) {
        return false;
      }
      return this.selectedCollections.length === this.filteredCollections.length;
    },
    tableFields() {
      return [
        {
          class: 'CollectionList-type align-middle',
          key: 'selected',
          label: '',
        },
        {
          class: 'CollectionList-type align-middle',
          key: 'type',
          label: '',
        },
        {
          key: 'name',
          label: 'Name',
          sortable: true,
          class: 'CollectionList-name align-middle',
        },
        {
          class: 'CollectionList-actions align-middle text-right',
          key: 'actions',
          label: '',
        },
      ];
    },
    deleteIndexModalId() {
      return `delete-index-${this.indexName}`;
    },
    currentEnvironment() {
      return this.kuzzleStore.currentEnvironment;
    },
  },
  async created() {
    this.updateFilteredCollections(this.collections);
  },
  methods: {
    truncateName,
    onDeleteIndexCancel() {
      this.$refs[this.deleteIndexModalId].resetForm();
      this.$bvModal.hide(this.deleteIndexModalId);
    },
    async onDeleteIndexConfirm() {
      try {
        await this.storageIndexStore.deleteIndex(this.index);
        this.$bvModal.hide(this.deleteIndexModalId);
        this.$router.push({ name: 'Indexes', params: {} });
      } catch (err) {
        this.$refs[this.deleteIndexModalId].setError(err.message);
      }
    },
    onDeleteIndexClicked() {
      this.$bvModal.show(`delete-index-${this.indexName}`);
    },
    onDeleteCollectionClicked(collection) {
      this.collectionToDelete = collection;
      this.$bvModal.show(this.deleteCollectionModalId);
    },
    deleteCollections() {
      this.$bvModal.show(this.bulkDeleteCollectionsModalId);
    },
    onToggleAllClicked() {
      if (this.allChecked) {
        this.selectedCollections = [];
        return;
      }

      this.selectedCollections = [];
      this.selectedCollections = this.filteredCollections;
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
    async onDeleteModalSuccess() {
      this.updateFilteredCollections(this.collections);
    },
    navigateToCollection() {
      const collection = this.filteredCollections[0];

      if (!collection) {
        return;
      }

      const route = {
        name: collection.type === 'realtime' ? 'WatchCollection' : 'DocumentList',
        params: {
          indexName: this.index.name,
          collectionName: collection.name,
        },
      };

      this.$router.push(route);
    },
    updateFilteredCollections(filteredCollections) {
      this.filteredCollections = filteredCollections;
    },
  },
};
</script>

<style lang="scss" rel="stylesheet/scss">
.CollectionList-type {
  width: 2em;
  color: #555;
}
.CollectionList-actions {
  width: 30%;
}
.CollectionList-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  a {
    color: #222;
    font-weight: 500;
  }
}
</style>
