<template>
  <div>
    <filters
      @filters-quick-search="quickSearch"
      @filters-basic-search="basicSearch"
      @filters-raw-search="rawSearch"
      @filters-refresh-search="refreshSearch"
      :available-filters="availableFilters"
      :search-term="searchTerm"
      :raw-filter="rawFilter"
      :basic-filter="basicFilter"
      :sorting="sorting"
      :format-from-basic-search="formatFromBasicSearch"
      :format-sort="formatSort"
      :set-basic-filter="setBasicFilter"
      :basic-filter-form="basicFilterForm">
    </filters>

    <div class="card-panel card-body">
      <div class="row valign-center empty-set" v-show="!documents.length">
        <div class="col s2 offset-s1">
          <i class="fa fa-6x fa-search grey-text text-lighten-1" aria-hidden="true"></i>
        </div>
        <div class="col s12">
          <p>
            There is no result matching your query<br />
            Please try with another filters.
          </p>
          <p>
            <em>Learn more about filtering syntax on <a href="http://kuzzle.io/guide/#filtering-syntax" target="_blank">http://kuzzle.io/guide</a></em>
          </p>
        </div>
      </div>

      <div class="row actions" v-if="documents.length">
        <div class="col s8">
          <button
            class="btn btn-small waves-effect waves-light tertiary"
            @click="dispatchToggle">
            <i class="fa left"
               :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
            ></i>
            Toggle all
          </button>

          <button class="btn btn-small waves-effect waves-light margin-right-5 primary"
                  @click.prevent="create"
                  :class="!displayCreate ? 'disabled' : ''"
                  :disabled="!displayCreate"
                  :title="displayCreate ? '' : 'You are not allowed to create a document in this collection'">
            <i class="fa fa-plus-circle left"></i>
            Create
          </button>

          <button class="btn btn-small waves-effect waves-light"
                  :class="displayBulkDelete ? 'red-color' : 'disabled'"
                  :disabled="!displayBulkDelete"
                  @click="deleteBulk"
                  :title="displayBulkDelete ? '' : 'You need to select at least one element'">
            <i class="fa fa-minus-circle left"></i>
            Delete
          </button>
        </div>
      </div>

      <div class="row" v-show="documents.length">
        <div class="col s12">
          <slot v-if="documents.length" @delete-document="deleteDocument"></slot>
        </div>
      </div>

      <div class="row" v-show="documents.length">
      <div class="col s12">
        <pagination
                @change-page="changePage"
                :total="totalDocuments"
                :from="paginationFrom"
                :size="paginationSize"
        ></pagination>
      </div>
    </div>
    </div>

    <modal id="bulk-delete" :is-open="bulkDeleteIsOpen" :close="close">
      <h4>Document deletion</h4>
      <p>Do you really want to delete {{lengthDocument}} {{lengthDocument | pluralizeDocument}}?</p>

      <span slot="footer">
        <button
          href="#"
          class="waves-effect waves-green btn red-color"
          @click="confirmBulkDelete()">
            I'm sure!
        </button>
        <button href="#" class="btn-flat" @click.prevent="close">
            Cancel
        </button>
      </span>
    </modal>

    <modal id="single-delete" :is-open="singleDeleteIsOpen" :close="close">
      <h4>Delete element</h4>
      <p>Do you really want to delete {{documentIdToDelete}}?</p>

      <span slot="footer">
        <button
          class="waves-effect waves-green btn red-color"
          @click="confirmSingleDelete(documentIdToDelete)">
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
  import Pagination from '../Materialize/Pagination'
  import Modal from '../Materialize/Modal'
  import Filters from './Filters/Filters'
  import {SET_BASIC_FILTER} from '../../vuex/modules/common/crudlDocument/mutation-types'
  import {
    basicFilterForm
  } from '../../vuex/modules/common/crudlDocument/getters'
  import {formatFromBasicSearch, formatSort} from '../../services/filterFormat'
  import {deleteDocuments} from '../../services/kuzzleWrapper'

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
      searchTerm: String,
      rawFilter: Object,
      basicFilter: Array,
      sorting: Object,
      availableFilters: Object,
      documentToDelete: String
    },
    vuex: {
      getters: {
        basicFilterForm
      }
    },
    data () {
      return {
        formatFromBasicSearch,
        formatSort,
        documentIdToDelete: '',
        singleDeleteIsOpen: false,
        bulkDeleteIsOpen: false
      }
    },
    filters: {
      pluralizeDocument (count) {
        if (count > 1) {
          return 'documents'
        }
        return 'document'
      }
    },
    methods: {
      create () {
        this.$emit('create-clicked', 'DataCreateDocument')
      },
      changePage (from) {
        this.$router.push({query: {...this.$route.query, from}})
      },
      confirmBulkDelete () {
        deleteDocuments(this.index, this.collection, this.selectedDocuments)
          .then(() => {
            this.refreshSearch()
            this.close()
          })
          .catch((e) => {
            this.$emit('toast', e.message, 'error')
          })
      },
      confirmSingleDelete (id) {
        deleteDocuments(this.index, this.collection, [id])
          .then(() => {
            this.refreshSearch()
            this.close()
          })
          .catch((e) => {
            this.$emit('toast', e.message, 'error')
          })
      },
      quickSearch (searchTerm) {
        this.$router.push({query: {searchTerm, from: 0}})
      },
      basicSearch (filters, sorting) {
        console.log('## kk', filters, sorting)
        if (!filters && !sorting) {
          this.$router.push({query: {basicFilter: null, sorting: null, from: 0}})
          return
        }

        let basicFilter = JSON.stringify(filters)
        this.$router.push({query: {basicFilter, sorting: JSON.stringify(sorting), from: 0}})
      },
      rawSearch (filters) {
        if (!filters || Object.keys(filters).length === 0) {
          this.$router.push({query: {rawFilter: null, from: 0}})
          return
        }

        let rawFilter = JSON.stringify(filters)
        this.$router.push({query: {rawFilter, from: 0}})
      },
      refreshSearch () {
        // If we are already on the page, the $router.go function doesn't trigger the route.meta.data() function of top level components...
        // https://github.com/vuejs/vue-router/issues/296
        this.$emit('crudl-refresh-search')
        if (this.$route.query.from === '0') {
          this.$emit('crudl-refresh-search')
          return
        }

        this.$router.push({query: {...this.$route.query, from: 0}})
      },
      dispatchToggle () {
        this.$emit('toggle-all')
      },
      setBasicFilter (value) {
        this.$store.commit(SET_BASIC_FILTER, value)
      },
      deleteBulk () {
        this.bulkDeleteIsOpen = true
      },
      close () {
        this.singleDeleteIsOpen = false
        this.bulkDeleteIsOpen = false
        this.documentIdToDelete = []
      }
    },
    watch: {
      documentToDelete (val) {
        this.documentIdToDelete = val
        this.singleDeleteIsOpen = true
      }
    }
  }
</script>
