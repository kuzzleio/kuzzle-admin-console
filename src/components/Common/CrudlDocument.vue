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

      <div class="row actions" v-show="documents.length">
        <div class="col s8">
          <button
            class="btn btn-small waves-effect waves-light tertiary"
            @click="dispatchToggle">
            <i class="fa left"
               :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
            ></i>
            Toggle all
          </button>

          <button class="btn btn-small waves-effect waves-light margin-right-5 primary" @click.prevent="create"><i class="fa fa-plus-circle left"></i>Create</button>
          <button class="btn btn-small waves-effect waves-light"
                  :class="displayBulkDelete ? 'red' : 'disabled'"
                  :disabled="!displayBulkDelete"
                  @click="$broadcast('modal-open', 'bulk-delete')">
            <i class="fa fa-minus-circle left"></i>
            Delete
          </button>
        </div>
      </div>

      <div class="row" v-show="documents.length">
        <div class="col s12">
          <slot v-if="documents.length"></slot>
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

    <modal id="bulk-delete">
      <h4>Document deletion</h4>
      <p>Do you really want to delete {{lengthDocument}} {{lengthDocument | pluralize 'document'}}?</p>

      <span slot="footer">
            <button
              href="#"
              class="waves-effect waves-green btn red"
              @click="confirmBulkDelete()">
                I'm sure!
            </button>
            <button href="#" class="btn-flat" @click.prevent="$broadcast('modal-close', 'bulk-delete')">
                Cancel
            </button>
          </span>
    </modal>

    <modal id="single-delete">
      <h4>Delete user</h4>
      <p>Do you really want to delete {{documentIdToDelete}}?</p>

      <span slot="footer">
            <button
              href="#"
              class="waves-effect waves-green btn red"
              @click="confirmSingleDelete(documentIdToDelete)">
                I'm sure!
            </button>
            <button href="#" class="btn-flat" @click.prevent="$broadcast('modal-close', 'single-delete')">
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
  import {
    setBasicFilter
  } from '../../vuex/modules/common/crudlDocument/actions'
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
      rawFilter: String,
      basicFilter: Array,
      sorting: Object,
      availableFilters: Object
    },
    vuex: {
      actions: {
        setBasicFilter
      },
      getters: {
        basicFilterForm
      }
    },
    data () {
      return {
        formatFromBasicSearch,
        formatSort,
        documentIdToDelete: ''
      }
    },
    methods: {
      create () {
        this.$dispatch('create-clicked')
      },
      changePage (from) {
        this.$router.go({query: {...this.$route.query, from}})
      },
      confirmBulkDelete () {
        this.$broadcast('modal-close', 'bulk-delete')
        deleteDocuments(this.index, this.collection, this.selectedDocuments)
          .then(() => {
            this.refreshSearch()
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      },
      confirmSingleDelete (id) {
        this.$broadcast('modal-close', 'single-delete')
        deleteDocuments(this.index, this.collection, [id])
          .then(() => {
            this.refreshSearch()
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      },
      quickSearch (searchTerm) {
        this.$router.go({query: {searchTerm, from: 0}})
      },
      basicSearch (filters, sorting) {
        if (!filters && !sorting) {
          this.$router.go({query: {basicFilter: null, sorting: null, from: 0}})
          return
        }

        let basicFilter = JSON.stringify(filters)
        this.$router.go({query: {basicFilter, sorting: JSON.stringify(sorting), from: 0}})
      },
      rawSearch (filters) {
        if (!filters || Object.keys(filters).length === 0) {
          this.$router.go({query: {rawFilter: null, from: 0}})
          return
        }

        let rawFilter = JSON.stringify(filters)
        this.$router.go({query: {rawFilter, from: 0}})
      },
      refreshSearch () {
        // If we are already on the page, the $router.go function doesn't trigger the route.data() function of top level components...
        // https://github.com/vuejs/vue-router/issues/296
        if (this.$route.query.from === '0') {
          this.$dispatch('crudl-refresh-search')
          return
        }

        this.$router.go({query: {...this.$route.query, from: 0}})
      },
      dispatchToggle () {
        this.$dispatch('toggle-all')
      }
    },
    events: {
      'delete-document' (id) {
        this.documentIdToDelete = id
        this.$broadcast('modal-open', 'single-delete')
      }
    }
  }
</script>
