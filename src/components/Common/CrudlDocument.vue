<template>
  <div>
    <filters
      @quick-search="onQuickSearch"
      @basic-search="onBasicSearch"
      @raw-search="onRawSearch"
      @refresh-search="onRefreshSearch"
      @reset-search="onResetSearch"
      :available-filters="availableFilters"
      :simple-filter-term="searchTerm"
      :raw-filter="rawFilter"
      :basic-filter="basicFilter"
      :sorting="sorting"
      :format-from-basic-search="formatFromBasicSearch"
      >
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
            <em>Learn more about filtering syntax on <a href="http://docs.kuzzle.io/elasticsearch-cookbook/" target="_blank">Kuzzle Elasticsearch Cookbook</a></em>
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
                  @click.prevent="onCreateClicked"
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

      <div class="row collection-wrapper" v-show="documents.length">
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
                :max-page="1000"
                :number-in-page="documents.length"
        ></pagination>
      </div>
    </div>
    </div>

    <modal id="bulk-delete" :is-open="bulkDeleteIsOpen" :close="close" :loading="isLoading">
      <h4>Document deletion</h4>
      <p>Do you really want to delete {{lengthDocument}} documents?</p>

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

    <modal id="single-delete" :is-open="singleDeleteIsOpen" :close="close" :loading="isLoading">
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
  import {formatFromBasicSearch, formatSort} from '../../services/filterFormat'
  import {SET_TOAST} from '../../vuex/modules/common/toaster/mutation-types'

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
      documentToDelete: String,
      performDelete: Function
    },
    data () {
      return {
        formatFromBasicSearch,
        formatSort,
        documentIdToDelete: '',
        singleDeleteIsOpen: false,
        bulkDeleteIsOpen: false,
        isLoading: false
      }
    },
    methods: {

      onCreateClicked () {
        this.$emit('create-clicked')
      },

      changePage (from) {
        this.$router.push({query: {...this.$route.query, from}})
      },
      confirmBulkDelete () {
        this.isLoading = true
        this.performDelete(this.index, this.collection, this.selectedDocuments)
          .then(() => {
            this.close()
            this.refreshSearch()
            this.isLoading = false
            return null
          })
          .catch((e) => {
            this.$store.commit(SET_TOAST, {text: e.message})
          })
      },
      confirmSingleDelete (id) {
        this.performDelete(this.index, this.collection, [id])
          .then(() => {
            this.close()
            this.refreshSearch()
            return null
          })
          .catch((e) => {
            this.$store.commit(SET_TOAST, {text: e.message})
          })
      },
      onQuickSearch (searchTerm) {
        console.log('quickSearch')
        this.$router.push({query: {searchTerm, from: 0}}, () => {
          this.$emit('crudl-refresh-search')
        }, () => {
          this.$emit('crudl-refresh-search')
        })
      },
      onBasicSearch (filter, sorting) {
        console.log('basicSearch')
        if (!filter && !sorting) {
          this.$router.push({query: {basicFilter: null, sorting: null, from: 0}})
        } else {
          let basicFilter = JSON.stringify(filter)
          this.$router.push({
            query: {
              basicFilter,
              sorting: JSON.stringify(sorting),
              from: 0}
          })
        }
      },
      onRawSearch (filter) {
        console.log('rawSearch')
        this.storeCurrentFilter('rawFilter', filter)
        if (!filter || Object.keys(filter).length === 0) {
          this.$router.push({query: {rawFilter: null, from: 0}})
          return
        }

        let rawFilter = JSON.stringify(filter)
        this.$router.push({query: {rawFilter, from: 0}})
      },
      onRefreshSearch () {
        // If we are already on the page, the $router.go function doesn't trigger the route.meta.data() function of top level components...
        // https://github.com/vuejs/vue-router/issues/296
        if (parseInt(this.$route.query.from) === 0) {
          this.$emit('crudl-refresh-search')
        } else {
          this.$router.push({query: {...this.$route.query, from: 0}})
        }
      },
      onResetSearch () {
        this.$emit('reset-search')
      },
      dispatchToggle () {
        this.$emit('toggle-all')
      },
      setBasicFilter (value) {
        console.log('setBasicFilter')
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
