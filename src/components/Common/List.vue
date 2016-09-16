.<template>
  <div>
    <slot name="emptySet" v-if="!(basicFilter || rawFilter || sorting || searchTerm) && totalDocuments === 0"></slot>
    <crudl-document v-else
      :available-filters="availableFilters"
      :pagination-from="paginationFrom"
      :sorting="sorting"
      :basic-filter="basicFilter"
      :raw-filter="rawFilter"
      :search-term="searchTerm"
      :pagination-size="paginationSize"
      :index="index"
      :collection="collection"
      :documents="documents"
      :total-documents="totalDocuments"
      :display-bulk-delete="displayBulkDelete"
      :all-checked="allChecked"
      :selected-documents="selectedDocuments"
      :length-document="selectedDocuments.length">

        <div class="collection">
          <div class="collection-item" transition="collection" v-for="document in documents">
            <component :is="itemName" @checkbox-click="toggleSelectDocuments" :document="document"
                       :is-checked="isChecked(document.id)"></component>
          </div>
        </div>

    </crudl-document>
  </div>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .collection {
    overflow: visible;
  }
</style>

<script>
  import CrudlDocument from './CrudlDocument'
  import UserItem from '../Security/Users/UserItem'
  import RoleItem from '../Security/Roles/RoleItem'
  import ProfileItem from '../Security/Profiles/ProfileItem'
  import DocumentItem from '../Data/Documents/DocumentItem'
  import {
    searchTerm,
    rawFilter,
    basicFilter,
    sorting,
    paginationFrom,
    paginationSize
  } from '../../vuex/modules/common/crudlDocument/getters'
  import { formatFromQuickSearch, formatFromBasicSearch, formatSort, availableFilters } from '../../services/filterFormat'
  import { performSearch } from '../../services/kuzzleWrapper'

  export default {
    name: 'CommonList',
    props: {
      index: String,
      collection: String,
      itemName: String
    },
    components: {
      CrudlDocument,
      UserItem,
      RoleItem,
      ProfileItem,
      DocumentItem
    },
    data () {
      return {
        availableFilters,
        selectedDocuments: [],
        documents: [],
        totalDocuments: 0
      }
    },
    vuex: {
      getters: {
        searchTerm,
        rawFilter,
        basicFilter,
        sorting,
        paginationFrom,
        paginationSize
      }
    },
    computed: {
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      },
      allChecked () {
        if (!this.selectedDocuments || !this.documents) {
          return false
        }

        return this.selectedDocuments.length === this.documents.length
      }
    },
    methods: {
      isChecked (id) {
        return this.selectedDocuments.indexOf(id) > -1
      },
      toggleAll () {
        if (this.allChecked) {
          this.selectedDocuments = []
          return
        }
        this.selectedDocuments = []
        this.selectedDocuments = this.documents.map((document) => document.id)
      },
      toggleSelectDocuments (id) {
        let index = this.selectedDocuments.indexOf(id)

        if (index === -1) {
          this.selectedDocuments.push(id)
          return
        }

        this.selectedDocuments.splice(index, 1)
      },
      hasSearchFilters () {
        return this.searchTerm !== '' || this.basicFilter.length > 0 || this.rawFilter.length > 0
      },
      fetchData () {
        this.selectedDocuments = []

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
        performSearch(this.collection, this.index, filters, pagination, sorting)
          .then(res => {
            this.documents = res.documents
            this.totalDocuments = res.total
          })
          .catch((e) => {
            this.$dispatch('toast', 'An error occurred while performing search: <br />' + e.message, 'error')
          })
      }
    },
    events: {
      'toggle-all' () {
        this.toggleAll()
      },
      'crudl-refresh-search' () {
        this.fetchData()
      }
    }
  }
</script>
