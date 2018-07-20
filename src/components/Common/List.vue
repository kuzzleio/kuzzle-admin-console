<template>
  <div>
    <slot name="emptySet" v-if="isCollectionEmpty"></slot>
    <crudl-document v-else
      :available-filters="availableFilters"
      :pagination-from="paginationFrom"
      :sorting="sorting"
      :basic-filter="basicFilter"
      :raw-filter="rawFilter"
      :search-term="$store.state.route.query.searchTerm"
      :pagination-size="paginationSize"
      :index="index"
      :collection="collection"
      :documents="documents"
      :total-documents="totalDocuments"
      :display-bulk-delete="displayBulkDelete"
      :display-create="displayCreate"
      :all-checked="allChecked"
      :selected-documents="selectedDocuments"
      :length-document="selectedDocuments.length"
      :document-to-delete="documentToDelete"
      :perform-delete="performDelete"
      @create-clicked="create"
      @toggle-all="toggleAll"
      @crudl-refresh-search="fetchData">

        <div class="collection">
          <div class="collection-item collection-transition" v-for="document in documents" :key="document.id">
            <component :is="itemName"
                       @checkbox-click="toggleSelectDocuments"
                       :document="document"
                       :is-checked="isChecked(document.id)"
                       :index="index"
                       :collection="collection"
                       @common-list::edit-document="editDocument"
                       @delete-document="deleteDocument">
            </component>
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
  import { formatFromQuickSearch, formatFromBasicSearch, formatSort, availableFilters } from '../../services/filterFormat'
  import {SET_TOAST} from '../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'CommonList',
    props: {
      index: String,
      collection: String,
      itemName: String,
      displayCreate: {
        type: Boolean,
        default: false
      },
      performSearch: Function,
      performDelete: Function,
      routeCreate: String,
      routeUpdate: String
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
        totalDocuments: 0,
        documentToDelete: null
      }
    },
    computed: {
      isDocumentListFiltered () {
        return this.basicFilter || this.rawFilter || this.sorting || this.$store.state.route.query.searchTerm
      },
      isCollectionEmpty () {
        return !(this.isDocumentListFiltered) && this.totalDocuments === 0
      },
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      },
      allChecked () {
        if (!this.selectedDocuments || !this.documents) {
          return false
        }

        return this.selectedDocuments.length === this.documents.length
      },
      basicFilter () {
        try {
          return JSON.parse(this.$store.state.route.query.basicFilter)
        } catch (e) {
          return null
        }
      },
      rawFilter () {
        try {
          return JSON.parse(this.$store.state.route.query.rawFilter)
        } catch (e) {
          return null
        }
      },
      sorting () {
        if (!this.$store.state.route.query.sorting) {
          return null
        }

        try {
          return JSON.parse(this.$store.state.route.query.sorting)
        } catch (e) {
          return []
        }
      },
      paginationFrom () {
        return parseInt(this.$store.state.route.query.from) || 0
      },
      paginationSize () {
        return parseInt(this.$store.state.route.query.size) || 10
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
        return this.$store.state.route.query.searchTerm !== '' || this.basicFilter.length > 0 || this.rawFilter.length > 0
      },
      fetchData () {
        this.selectedDocuments = []

        let filters = {}
        let sorting = ['_uid'] // by default, sort on uid: prevent random order
        let pagination = {
          from: this.paginationFrom,
          size: this.paginationSize
        }
        // Manage query quickSearch/basicSearch/rawSearch
        if (this.$store.state.route.query.searchTerm) {
          filters = formatFromQuickSearch(this.$store.state.route.query.searchTerm)
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

        // TODO: refactor how search is done
        // Execute search with corresponding filters
        this.performSearch(this.collection, this.index, filters, pagination, sorting)
          .then(res => {
            this.documents = res.documents
            this.totalDocuments = res.total
          })
          .catch((e) => {
            this.$store.commit(SET_TOAST, {text: 'An error occurred while performing search: <br />' + e.message})
          })
      },
      editDocument (route, id) {
        this.$router.push({name: this.routeUpdate, params: {id: encodeURIComponent(id)}})
      },
      deleteDocument (id) {
        this.documentToDelete = id
      },
      refreshSearch () {
        this.fetchData()
      },
      create (route) {
        this.$router.push({name: this.routeCreate})
      }
    },
    mounted () {
      this.fetchData()
    },
    watch: {
      '$route' () {
        this.refreshSearch()
      }
    }
  }
</script>
