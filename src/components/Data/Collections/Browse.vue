<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Browse
      <collection-dropdown class="icon-medium icon-black" :id="index"></collection-dropdown>
    </headline>

    <crudl-document @create-clicked="createDocument" :index="index" :collection="collection" :documents="documents" :display-bulk-delete="displayBulkDelete" :all-checked="allChecked" :selected-documents="selectedDocuments" :length-document="selectedDocuments.length">
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
  import {performSearch} from '../../../vuex/modules/common/crudlDocument/actions'
  import jQueryCollapsible from '../../Materialize/collapsible'
  import CollectionDropdown from '../Collections/Dropdown'
  import DocumentItem from '../Documents/DocumentItem'
  import CrudlDocument from '../../Common/CrudlDocument'
  import {
    searchTerm,
    rawFilter,
    basicFilter,
    sorting
  } from '../../../vuex/modules/common/crudlDocument/getters'
  import {formatFromQuickSearch, formatFromBasicSearch, formatSort} from '../../../services/filterFormat'

  export default {
    name: 'CollectionBrowse',
    directives: [
      jQueryCollapsible
    ],
    props: {
      index: String,
      collection: String
    },
    data () {
      return {
        selectedDocuments: [],
        documents: []
      }
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
        if (!this.selectedDocuments || !this.documents) {
          return false
        }

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
      },
      fetchData () {
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
          .then(res => {
            this.documents = res
          })
      }
    },
    vuex: {
      actions: {
        performSearch
      },
      getters: {
        searchTerm,
        rawFilter,
        basicFilter,
        sorting
      }
    },
    events: {
      'toggle-all' () {
        this.toggleAll()
      },
      'crudl-refresh-search' () {
        this.fetchData()
      }
    },
    route: {
      data () {
        this.fetchData()
      }
    }
  }
</script>
