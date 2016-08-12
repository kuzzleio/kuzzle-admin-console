<template>
  <div>
    <filters
      @filters-quick-search="quickSearch"
      @filters-basic-search="basicSearch"
      @filters-raw-search="rawSearch"
      @filters-refresh-search="refreshSearch"
      :search-term="searchTerm"
      :raw-filter="rawFilter"
      :basic-filter="basicFilter"
      :sorting="sorting"
      :format-from-basic-search="formatFromBasicSearch"
      :format-sort="formatSort"
      :set-basic-filter="setBasicFilter"
      :basic-filter-form="basicFilterForm">
    </filters>

    <div>
      <div class="row">
        <div class="col s10 list-document">
          <div>
            <button class="btn waves-effect waves-light left margin-right-5" @click.prevent="create"><i class="fa fa-plus-circle left"></i>Create</button>
            <div v-if="documents.length">
              <button
                class="btn waves-effect waves-light tertiary"
                @click="dispatchToggle">
                <i class="fa left"
                   :class="allChecked ? 'fa-check-square-o' : 'fa-square-o'"
                ></i>
                Toggle all
              </button>
              <button
                class="btn waves-effect waves-light"
                :class="displayBulkDelete ? 'red' : 'disabled'"
                :disabled="!displayBulkDelete"
                @click="$broadcast('modal-open', 'bulk-delete')">
                <i class="fa fa-minus-circle left"></i>
                Delete
              </button>

              <slot></slot>

              <pagination
                @change-page="changePage"
                :total="totalDocuments"
                :from="paginationFrom"
                :size="paginationSize"
              ></pagination>
            </div>
          </div>

          <div v-if="!documents.length" class="no-document">
            There is no result corresponding to your search!
          </div>
        </div>
      </div>
    </div>

    <modal id="bulk-delete">
      <h4>Users deletion</h4>
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
      <h4>Users deletion</h4>
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

<style type="text/css" media="screen" scoped>
  .margin-right-5 {
    margin-right: 5px;
  }
</style>

<script>
  import Pagination from '../Materialize/Pagination'
  import Modal from '../Materialize/Modal'
  import Filters from './Filters/Filters'
  import {
    deleteDocuments,
    setBasicFilter
  } from '../../vuex/modules/common/crudlDocument/actions'
  import {
    basicFilterForm
  } from '../../vuex/modules/common/crudlDocument/getters'
  import {formatFromBasicSearch, formatSort} from '../../services/filterFormat'

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
      basicFilter: String,
      sorting: String
    },
    vuex: {
      actions: {
        deleteDocuments,
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
        this.deleteDocuments(this.index, this.collection, this.selectedDocuments)
          .then(() => {
            this.refreshSearch()
          })
          .catch((e) => {
            this.$dispatch('toast', e.message, 'error')
          })
      },
      confirmSingleDelete (id) {
        this.$broadcast('modal-close', 'single-delete')
        this.deleteDocuments(this.index, this.collection, [id])
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
