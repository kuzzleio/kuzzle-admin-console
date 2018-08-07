.<template>
  <div>
    <slot name="emptySet" v-if="!(basicFilter || rawFilter || $store.state.route.query.searchTerm) && totalDocuments === 0"></slot>
    <crudl-document v-else
      :available-filters="availableFilters"
      :pagination-from="paginationFrom"
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
  import UserItem from '../Users/UserItem'
  import RoleItem from '../Roles/RoleItem'
  import ProfileItem from '../Profiles/ProfileItem'
  import DocumentItem from '../../Data/Documents/DocumentItem'
  import { availableFilters } from '../../../services/filterManager'
  import {SET_TOAST} from '../../../vuex/modules/common/toaster/mutation-types'

  export default {
    name: 'SecurityCommonList',
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
        let pagination = {
          from: this.paginationFrom,
          size: this.paginationSize
        }

        // Execute search with corresponding filters
        this.performSearch(JSON.parse(this.$store.state.route.query.basicFilter || '{}'), pagination)
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
