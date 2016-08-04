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
          <div v-if="documents.length">
            <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
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

          <div v-if="!documents.length" class="no-document">
            There is no user corresponding to your search!
          </div>
        </div>
      </div>
    </div>

    <modal id="bulk-delete">
      <h4>Users deletion</h4>
      <p>Do you really want to delete {{lengthDocument}} users?</p>

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
  </div>
</template>

<script>
  import Pagination from '../Materialize/Pagination'
  import Modal from '../Materialize/Modal'
  import Filters from './Filters/Filters'
  import {
    deleteDocument,
    deleteDocuments,
    performSearch,
    setBasicFilter
  } from '../../vuex/modules/common/crudlDocument/actions'
  import {
    totalDocuments,
    paginationFrom,
    paginationSize,
    searchTerm,
    rawFilter,
    basicFilter,
    sorting,
    basicFilterForm
  } from '../../vuex/modules/common/crudlDocument/getters'
  import {formatFromQuickSearch, formatFromBasicSearch, formatSort} from '../../services/filterFormat'

  export default {
    name: 'CrudlDocument',
    components: {
      Pagination,
      Modal,
      Filters
    },
    props: [
      'index',
      'collection',
      'documents',
      'displayBulkDelete',
      'allChecked',
      'lengthDocument'
    ],
    vuex: {
      actions: {
        deleteDocument,
        deleteDocuments,
        performSearch,
        setBasicFilter
      },
      getters: {
        totalDocuments,
        paginationFrom,
        paginationSize,
        searchTerm,
        rawFilter,
        basicFilter,
        sorting,
        basicFilterForm
      }
    },
    data () {
      return {
        formatFromBasicSearch,
        formatSort
      }
    },
    methods: {
      changePage (from) {
        this.$router.go({query: {...this.$route.query, from}})
      },
      confirmBulkDelete () {
        this.$broadcast('modal-close', 'bulk-delete')
        this.deleteDocuments(this.selectedDocuments)
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
        this.$dispatch('toggle-foo')
      }
    },
    events: {
      'perform-search' () {
        let filters = {}
        let sorting = []
        let pagination = {
          from: this.paginationFrom,
          size: this.paginationSize
        }

        // Manage query quickSearch/basicSearch/rawSearch
        if (this.searchTerm) {
          filters = formatFromQuickSearch(this.searchTerm)
        } else if (this.basicFilter) {
          filters = formatFromBasicSearch(this.basicFilter)
        } else if (this.rawFilter) {
          filters = this.rawFilter
          if (filters.sort) {
            sorting = filters.sort
          }
        }

        if (this.sorting) {
          sorting = formatSort(this.sorting)
        }

        // Execute search with corresponding filters
        this.performSearch(this.collection, this.index, filters, pagination, sorting)
      }
    }
  }
</script>
