<template>
  <div>
    <headline title="Users Management"></headline>
    <crudl-document :available-filters="availableFilters" :pagination-from="paginationFrom" :sorting="sorting" :basic-filter="basicFilter" :raw-filter="rawFilter" :search-term="searchTerm" :pagination-size="paginationSize" index="%kuzzle" collection="roles" :documents="documents" :total-documents="totalDocuments" :display-bulk-delete="displayBulkDelete" :all-checked="allChecked" :selected-documents="selectedDocuments" :length-document="selectedDocuments.length">
      <div class="collection">
        <div class="collection-item" transition="collection" v-for="document in documents">
          <profile-item @checkbox-click="toggleSelectDocuments" :profile="document"
                     :is-checked="isChecked(document.id)"></profile-item>
        </div>
      </div>
    </crudl-document>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import CrudlDocument from '../../Common/CrudlDocument'
  import ProfileItem from './ProfileItem'
  import {
    searchTerm,
    rawFilter,
    basicFilter,
    sorting,
    paginationFrom,
    paginationSize
  } from '../../../vuex/modules/common/crudlDocument/getters'
  import { formatFromQuickSearch, formatFromBasicSearch, formatSort, availableFilters } from '../../../services/filterFormat'
  import { performSearch } from '../../../services/kuzzleWrapper'

  export default {
    name: 'RolesList',
    components: {
      Headline,
      ProfileItem,
      CrudlDocument
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
    route: {
      data () {
        this.fetchData()
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
        performSearch('profiles', '%kuzzle', filters, pagination, sorting)
          .then(res => {
            this.documents = res.documents
            this.totalDocuments = res.total
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
