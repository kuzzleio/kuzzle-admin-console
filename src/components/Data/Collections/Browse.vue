<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Browse
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <crudl-document :available-filters="availableFilters" @create-clicked="createDocument" :pagination-from="paginationFrom" :sorting="sorting" :basic-filter="basicFilter" :raw-filter="rawFilter" :search-term="searchTerm" :pagination-size="paginationSize" :index="index" :collection="collection" :documents="documents" :total-documents="totalDocuments" :display-bulk-delete="displayBulkDelete" :all-checked="allChecked" :selected-documents="selectedDocuments" :length-document="selectedDocuments.length">
      <div class="collection">
        <div class="collection-item" transition="collection" v-for="document in documents">
          <document-item @checkbox-click="toggleSelectDocuments" :document="document" :is-checked="isChecked(document.id)"></document-item>
        </div>
      </div>
    </crudl-document>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import {performSearch} from '../../../services/kuzzleWrapper'
  import jQueryCollapsible from '../../../directives/collapsible.directive'
  import CollectionDropdown from '../Collections/Dropdown'
  import DocumentItem from '../Documents/DocumentItem'
  import CrudlDocument from '../../Common/CrudlDocument'
  import {
    searchTerm,
    rawFilter,
    basicFilter,
    paginationFrom,
    paginationSize
  } from '../../../vuex/modules/common/crudlDocument/getters'
  import {formatFromQuickSearch, formatFromBasicSearch, formatSort, availableFilters} from '../../../services/filterFormat'

  export default {
    name: 'CollectionBrowse',
    directives: [
      jQueryCollapsible
    ],
    data () {
      return {
        availableFilters,
        selectedDocuments: [],
        documents: [],
        totalDocuments: 0
      }
    },
    props: {
      index: String,
      collection: String
    },
    components: {
      Headline,
      CollectionDropdown,
      DocumentItem,
      CrudlDocument
    },
    computed: {
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      },
      allChecked () {
        return this.selectedDocuments.length === this.documents.length
      }
    },
    methods: {
      createDocument () {
        this.$router.go({name: 'DataCreateDocument'})
      },
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
      }
    },
    vuex: {
      getters: {
        searchTerm,
        rawFilter,
        basicFilter,
        paginationFrom,
        paginationSize
      }
    },
    events: {
      'toggle-all' () {
        this.toggleAll()
      }
    },
    route: {
      data () {
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
        performSearch(this.collection, this.index, filters, pagination, sorting).then(res => {
          this.documents = res.documents
          this.totalDocuments = res.total
        })
      }
    }
  }
</script>
