<template>
  <div class="ProfileList">
    <slot name="emptySet" v-if="currentFilter.basic && totalDocuments === 0"></slot>
    <crudl-document v-else
      :current-filter="currentFilter"
      :pagination-from="paginationFrom"
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
      @filters-updated="onFiltersUpdated"
      @create-clicked="create"
      @toggle-all="toggleAll"
      @crudl-refresh-search="fetchProfiles">

      <div class="ProfileList-list collection">
        <div class="collection-item collection-transition" v-for="document in documents" :key="document.id">
          <component
            :is="itemName"
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

<script>
import CrudlDocument from './CrudlDocument'
import UserItem from '../Users/UserItem'
import RoleItem from '../Roles/RoleItem'
import ProfileItem from '../Profiles/ProfileItem'
import DocumentItem from '../../Data/Documents/DocumentListItem'
import * as filterManager from '../../../services/filterManager'
import { SET_TOAST } from '../../../vuex/modules/common/toaster/mutation-types'

export default {
  name: 'ProfileList',
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
  data() {
    return {
      selectedDocuments: [],
      documents: [],
      totalDocuments: 0,
      documentToDelete: null,
      currentFilter: new filterManager.Filter()
    }
  },
  computed: {
    displayBulkDelete() {
      return this.selectedDocuments.length > 0
    },
    allChecked() {
      if (!this.selectedDocuments || !this.documents) {
        return false
      }

      return this.selectedDocuments.length === this.documents.length
    },
    paginationFrom() {
      return parseInt(this.currentFilter.from) || 0
    },
    paginationSize() {
      return parseInt(this.currentFilter.size) || 10
    }
  },
  methods: {
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    },
    toggleAll() {
      if (this.allChecked) {
        this.selectedDocuments = []
        return
      }
      this.selectedDocuments = []
      this.selectedDocuments = this.documents.map(document => document.id)
    },
    toggleSelectDocuments(id) {
      let index = this.selectedDocuments.indexOf(id)

      if (index === -1) {
        this.selectedDocuments.push(id)
        return
      }

      this.selectedDocuments.splice(index, 1)
    },
    onFiltersUpdated(newFilters) {
      try {
        filterManager.saveToRouter(
          filterManager.stripDefaultValuesFromFilter(newFilters),
          this.$router
        )
      } catch (error) {
        this.$store.commit(SET_TOAST, {
          text:
            'An error occurred while updating filters: <br />' + error.message
        })
      }
    },
    fetchProfiles() {
      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      // Execute search with corresponding filters
      this.performSearch(this.currentFilter.basic || {}, pagination)
        .then(res => {
          this.documents = res.documents
          this.totalDocuments = res.total
        })
        .catch(e => {
          this.$store.commit(SET_TOAST, {
            text:
              'An error occurred while performing search: <br />' + e.message
          })
        })
    },
    editDocument(route, id) {
      this.$router.push({
        name: this.routeUpdate,
        params: { id: encodeURIComponent(id) }
      })
    },
    deleteDocument(id) {
      this.documentToDelete = id
    },
    create(route) {
      this.$router.push({ name: this.routeCreate })
    }
  },
  mounted() {
    this.currentFilter = Object.assign(
      new filterManager.Filter(),
      filterManager.loadFromRoute(this.$route)
    )
  },
  watch: {
    $route: {
      immediate: true,
      handler(newValue, oldValue) {
        this.currentFilter = Object.assign(
          new filterManager.Filter(),
          filterManager.loadFromRoute(this.$route)
        )
      }
    },
    currentFilter() {
      this.fetchProfiles()
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.ProfileList-list {
  overflow: visible;
}
</style>
