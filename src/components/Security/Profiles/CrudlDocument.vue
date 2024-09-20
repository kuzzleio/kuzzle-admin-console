<template>
  <div class="CrudlDocument">
    <filters
      :current-filter="currentFilter.basic"
      :index="index"
      :collection="collection"
      @filters-updated="onBasicFilterUpdated"
      @reset="onBasicFilterUpdated"
    />

    <div class="card-panel card-body">
      <div v-show="!documents.length" class="row valign-center empty-set">
        <div class="col s2 offset-s1">
          <i
            class="fa fa-6x fa-search grey-text text-lighten-1"
            aria-hidden="true"
          />
        </div>
        <div class="col s12">
          <p>
            There is no result matching your query<br />
            Please try with another filters.
          </p>
          <p>
            <em
              >Learn more about filtering syntax on
              <a
                href="https://docs.kuzzle.io/core/2/guides/cookbooks/elasticsearch/"
                target="_blank"
                >Kuzzle Elasticsearch Cookbook</a
              ></em
            >
          </p>
        </div>
      </div>

      <div v-if="documents.length" class="row actions">
        <div class="col s8">
          <button
            class="btn btn-small waves-effect waves-light tertiary"
            @click="dispatchToggle"
          >
            <i
              class="fa left"
              :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
            />
            Toggle all
          </button>

          <button
            class="btn btn-small waves-effect waves-light margin-right-5 primary"
            data-cy="CreateProfile-btn"
            :class="!displayCreate ? 'disabled' : ''"
            :disabled="!displayCreate"
            :title="
              displayCreate
                ? ''
                : 'You are not allowed to create a document in this collection'
            "
            @click.prevent="create"
          >
            <i class="fa fa-plus-circle left" />
            Create
          </button>

          <button
            class="btn btn-small waves-effect waves-light"
            :class="displayBulkDelete ? 'red-color' : 'disabled'"
            :disabled="!displayBulkDelete"
            :title="
              displayBulkDelete ? '' : 'You need to select at least one element'
            "
            @click="deleteBulk"
          >
            <i class="fa fa-minus-circle left" />
            Delete
          </button>
        </div>
      </div>

      <div
        v-show="documents.length"
        class="CrudlDocument-collection row collection-wrapper"
      >
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

    <modal
      id="bulk-delete"
      :is-open="bulkDeleteIsOpen"
      :close="close"
      :loading="isLoading"
    >
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
        <button href="#" class="btn-flat" @click.prevent="close">
          Cancel
        </button>
      </span>
    </modal>

    <modal
      id="single-delete"
      :is-open="singleDeleteIsOpen"
      :close="close"
      :loading="isLoading"
    >
      <h4>Delete element</h4>
      <p>Do you really want to delete {{ documentIdToDelete }}?</p>

      <span slot="footer">
        <button
          class="waves-effect waves-green btn red-color"
          @click="confirmSingleDelete(documentIdToDelete)"
        >
          I'm sure!
        </button>
        <button class="btn-flat" @click.prevent="close">
          Cancel
        </button>
      </span>
    </modal>
  </div>
</template>

<script>
import Pagination from '@/components/Materialize/Pagination.vue'
import Modal from '@/components/Materialize/Modal.vue'
import {
  formatFromBasicSearch,
  ACTIVE_BASIC,
  NO_ACTIVE
} from '@/services/filterManager'

import Filters from './Filters.vue'

export default {
  name: 'CrudlDocument',
  components: {
    Pagination,
    Modal,
    Filters
  },
  props: {
    index: String,
    collection: String,
    documents: Array,
    displayBulkDelete: Boolean,
    displayCreate: {
      type: Boolean,
      default: false
    },
    allChecked: Boolean,
    totalDocuments: Number,
    lengthDocument: {
      type: Number,
      default: 0
    },
    selectedDocuments: Array,
    paginationFrom: Number,
    paginationSize: Number,
    currentFilter: Object,
    documentToDelete: String,
    performDelete: Function
  },
  data() {
    return {
      formatFromBasicSearch,
      documentIdToDelete: '',
      singleDeleteIsOpen: false,
      bulkDeleteIsOpen: false,
      isLoading: false
    }
  },
  watch: {
    documentToDelete(val) {
      this.documentIdToDelete = val
      this.singleDeleteIsOpen = true
    }
  },
  methods: {
    create() {
      this.$emit('create-clicked')
    },
    changePage(from) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          from
        })
      )
    },
    onBasicFilterUpdated(filter) {
      this.onFiltersUpdated(
        Object.assign(this.currentFilter, {
          active: filter ? ACTIVE_BASIC : NO_ACTIVE,
          basic: filter,
          from: 0
        })
      )
    },
    confirmBulkDelete() {
      this.isLoading = true
      this.performDelete(this.index, this.collection, this.selectedDocuments)
        .then(() => {
          this.close()
          this.refreshSearch()
          this.isLoading = false
          return null
        })
        .catch(e => {
          this.$store.direct.commit.toaster.setToast({ text: e.message })
        })
    },
    confirmSingleDelete(id) {
      this.performDelete(this.index, this.collection, [id])
        .then(() => {
          this.close()
          this.refreshSearch()
          return null
        })
        .catch(e => {
          this.$store.direct.commit.toaster.setToast({ text: e.message })
        })
    },
    onFiltersUpdated(newFilters) {
      this.$emit('filters-updated', newFilters)
    },
    refreshSearch() {
      // If we are already on the page, the $router.go function doesn't trigger the route.meta.data() function of top level components...
      // https://github.com/vuejs/vue-router/issues/296
      if (parseInt(this.$route.query.from) === 0) {
        this.$emit('crudl-refresh-search')
      } else {
        this.$router.push({ query: { ...this.$route.query, from: 0 } })
      }
    },
    dispatchToggle() {
      this.$emit('toggle-all')
    },
    deleteBulk() {
      this.bulkDeleteIsOpen = true
    },
    close() {
      this.singleDeleteIsOpen = false
      this.bulkDeleteIsOpen = false
      this.documentIdToDelete = []
    }
  }
}
</script>

<style lang="scss" scoped>
.CrudlDocument-collection {
  min-height: 453px;
}
</style>
