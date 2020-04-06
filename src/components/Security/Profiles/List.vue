<template>
  <div class="ProfileList">
    <slot v-if="currentFilter.basic && totalDocuments === 0" name="emptySet" />
    <template v-else>
      <filters />
    </template>
    <!-- <crudl-document
      v-else
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
      :perform-delete="deleteProfiles"
      @filters-updated="onFiltersUpdated"
      @create-clicked="create"
      @toggle-all="toggleAll"
      @crudl-refresh-search="fetchProfiles"
    >
      <div class="ProfileList-list collection">
        <div
          v-for="document in documents"
          :key="document.id"
          class="collection-item collection-transition"
        >
          <component
            :is="itemName"
            :document="document"
            :is-checked="isChecked(document.id)"
            :index="index"
            :collection="collection"
            @checkbox-click="toggleSelectDocuments"
            @common-list::edit-document="editDocument"
            @delete-document="deleteDocument"
          />
        </div>
      </div>
    </crudl-document> -->
  </div>
</template>

<script>
// import CrudlDocument from './CrudlDocument'
// import UserItem from '../Users/UserItem'
// import RoleItem from '../Roles/RoleItem'
// import ProfileItem from '../Profiles/ProfileItem'
// import DocumentItem from '../../Data/Documents/DocumentListItem'
import Filters from './Filters'
import * as filterManager from '../../../services/filterManager'

export default {
  name: 'ProfileList',
  components: {
    Filters
    // CrudlDocument,
    // UserItem,
    // RoleItem,
    // ProfileItem,
    // DocumentItem
  },
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
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.currentFilter = Object.assign(
          new filterManager.Filter(),
          filterManager.loadFromRoute(this.$route)
        )
      }
    },
    currentFilter() {
      this.fetchProfiles()
    }
  },
  mounted() {
    this.currentFilter = Object.assign(
      new filterManager.Filter(),
      filterManager.loadFromRoute(this.$route)
    )
  },
  methods: {
    async deleteProfiles(index, collection, ids) {
      await this.performDelete(index, collection, ids)
      this.$set(
        this.selectedDocuments,
        this.selectedDocuments.splice(0, this.selectedDocuments.length)
      )
      this.fetchProfiles()
    },
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
        this.$store.direct.commit.toaster.setToast({
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
          this.$store.direct.commit.toaster.setToast({
            text:
              'An error occurred while performing search: <br />' + e.message
          })
        })
    },
    editDocument(route, id) {
      this.$router.push({
        name: this.routeUpdate,
        params: { id }
      })
    },
    deleteDocument(id) {
      this.documentToDelete = id
    },
    create() {
      this.$router.push({ name: this.routeCreate })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.ProfileList-list {
  overflow: visible;
}
</style>
