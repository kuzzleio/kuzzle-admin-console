<template>
  <div class="CrudlDocument">
    <div class="card-panel card-header">
      <filters
        :available-operands="searchFilterOperands"
        :current-filter="currentFilter"
        :collection-mapping="collectionMapping"
        :index="index"
        :collection="collection"
        @filters-updated="onFiltersUpdated"
        @reset="onFiltersUpdated"
      />
    </div>
    <div class="card-panel card-body">
      <div v-show="!documents.length" class="row valign-center empty-set">
        <div class="col s2 offset-s1">
          <i class="fa fa-6x fa-search grey-text text-lighten-1" aria-hidden="true" />
        </div>
        <div class="col s12">
          <p>
            There is no result matching your query
            <br />Please try with another filter.
          </p>
          <p>
            <em>
              Learn more about filtering syntax on
              <a
                href="https://docs.kuzzle.io/core/2/guides/cookbooks/elasticsearch/"
                target="_blank"
                >Kuzzle Elasticsearch Cookbook</a
              >
            </em>
          </p>
        </div>
      </div>

      <div v-if="documents.length" class="BulkActions row actions">
        <div class="col s8">
          <button class="btn btn-small waves-effect waves-light tertiary" @click="dispatchToggle">
            <i class="fa left" :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'" />
            Toggle all
          </button>

          <button
            class="btn btn-small waves-effect waves-light margin-right-5 primary"
            :class="!displayCreate ? 'disabled' : ''"
            :disabled="!displayCreate"
            :title="
              displayCreate ? '' : 'You are not allowed to create a document in this collection'
            "
            @click.prevent="onCreateClicked"
          >
            <i class="fa fa-plus-circle left" />
            Create
          </button>

          <button
            class="btn btn-small waves-effect waves-light"
            :class="displayBulkDelete ? 'red-color' : 'disabled'"
            :disabled="!displayBulkDelete"
            :title="displayBulkDelete ? '' : 'You need to select at least one element'"
            @click="deleteBulk"
          >
            <i class="fa fa-minus-circle left" />
            Delete
          </button>
        </div>
      </div>

      <div v-show="documents.length" class="row CrudlDocument-collection">
        <div class="col s12">
          <slot v-if="documents.length" @delete-document="deleteDocument" />
        </div>
      </div>

      <div v-show="documents.length" class="row">
        <div class="col s12">
          <pagination
            :total="totalDocuments"
            :from="paginationFrom"
            :size="paginationSize"
            :max-page="1000"
            :number-in-page="documents.length"
            @change-page="changePage"
          />
        </div>
      </div>
    </div>

    <modal id="bulk-delete" :is-open="bulkDeleteIsOpen" :close="close" :loading="isLoading">
      <h4>Document deletion</h4>
      <p>Do you really want to delete {{ lengthDocument }} documents?</p>

      <span slot="footer">
        <button
          href="#"
          class="waves-effect waves-green btn red-color"
          @click="confirmBulkDelete()"
        >
          I'm sure!
        </button>
        <button href="#" class="btn-flat" @click.prevent="close">Cancel</button>
      </span>
    </modal>

    <modal
      id="single-delete"
      class="SingleDeleteModal"
      :is-open="singleDeleteIsOpen"
      :close="close"
      :loading="isLoading"
    >
      <h4>Delete element</h4>
      <p>Do you really want to delete {{ documentIdToDelete }}?</p>

      <span slot="footer">
        <button
          class="SingleDeleteModal-confirmBtn waves-effect waves-green btn red-color"
          @click="confirmSingleDelete(documentIdToDelete)"
        >
          I'm sure!
        </button>
        <button class="btn-flat" @click.prevent="close">Cancel</button>
      </span>
    </modal>
  </div>
</template>

<script>
import Modal from '../Materialize/Modal.vue';
import Pagination from '../Materialize/Pagination.vue';
import { useToasterStore } from '@/stores';

import Filters from './Filters/Filters.vue';

export default {
  name: 'CrudlDocument',
  components: {
    Pagination,
    Modal,
    Filters,
  },
  props: {
    index: String,
    collection: String,
    documents: Array,
    displayBulkDelete: Boolean,
    displayCreate: {
      type: Boolean,
      default: false,
    },
    allChecked: Boolean,
    totalDocuments: Number,
    lengthDocument: {
      type: Number,
      default: 0,
    },
    selectedDocuments: Array,
    paginationFrom: Number,
    paginationSize: Number,
    currentFilter: Object,
    sorting: Object,
    searchFilterOperands: Object,
    documentToDelete: String,
    performDelete: Function,
    collectionMapping: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {
      toasterStore: useToasterStore(),
    };
  },
  data() {
    return {
      documentIdToDelete: '',
      singleDeleteIsOpen: false,
      bulkDeleteIsOpen: false,
      isLoading: false,
    };
  },
  watch: {
    documentToDelete(val) {
      this.documentIdToDelete = val;
      this.singleDeleteIsOpen = true;
    },
  },
  methods: {
    onCreateClicked() {
      this.$emit('create-clicked');
    },
    changePage(from) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from,
        }),
      );
    },
    confirmBulkDelete() {
      this.isLoading = true;
      this.performDelete(this.index, this.collection, this.selectedDocuments)
        .then(() => {
          this.close();
          this.refreshSearch();
          this.isLoading = false;
          return null;
        })
        .catch((e) => {
          this.toasterStore.toast = {
            text: e.message,
          };
        });
    },
    confirmSingleDelete(id) {
      this.performDelete(this.index, this.collection, [id])
        .then(() => {
          this.close();
          this.refreshSearch();
          return null;
        })
        .catch((e) => {
          this.toasterStore.toast = {
            text: e.message,
          };
        });
    },
    onFiltersUpdated(newFilters) {
      this.$emit('filters-updated', newFilters);
    },
    dispatchToggle() {
      this.$emit('toggle-all');
    },
    deleteBulk() {
      this.bulkDeleteIsOpen = true;
    },
    close() {
      this.singleDeleteIsOpen = false;
      this.bulkDeleteIsOpen = false;
      this.documentIdToDelete = [];
    },
    refreshSearch() {
      this.$emit('crudl-refresh-search');
    },
  },
};
</script>

<style lang="scss" scoped>
.CrudlDocument-collection {
  min-height: 453px; // @todo put this value into a variable
}
</style>
