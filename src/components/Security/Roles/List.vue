<template>
  <div class="RoleList">
    <template v-if="loading">
      <b-row class="text-center">
        <b-col>
          <b-spinner variant="primary" class="mt-5"></b-spinner>
        </b-col>
      </b-row>
    </template>
    <template v-else>
      <slot
        v-if="!currentFilter.basic && totalDocuments === 0"
        name="emptySet"
      />
      <template v-else>
        <filters
          class="mb-3"
          :current-filter="currentFilter.basic"
          @filters-updated="onFiltersUpdated"
          @reset="onFiltersUpdated"
        />
        <b-card
          class="light-shadow"
          :bg-variant="documents.length === 0 ? 'light' : 'default'"
        >
          <b-card-text class="p-0">
            <div v-show="!documents.length" class="row valign-center empty-set">
              <b-row align-h="center" class="valign-center empty-set">
                <b-col cols="2" class="text-center">
                  <i
                    class="fa fa-5x fa-search text-secondary mt-3"
                    aria-hidden="true"
                  />
                </b-col>
                <b-col md="6">
                  <h3 class="text-secondary font-weight-bold">
                    There is no result matching your query. Please try with
                    another filter.
                  </h3>
                  <p>
                    <em
                      >Learn more about filtering syntax on
                      <a
                        href="https://docs.kuzzle.io/core/2/guides/cookbooks/elasticsearch/basic-queries/"
                        target="_blank"
                        >Kuzzle Elasticsearch Cookbook</a
                      ></em
                    >
                  </p>
                </b-col>
              </b-row>
            </div>
            <div v-if="documents.length">
              <b-row no-gutters class="mb-2">
                <b-col cols="8">
                  <b-button
                    variant="outline-danger"
                    class="mr-2"
                    data-cy="UserList-bulkDeleteBtn"
                    :disabled="!displayBulkDelete"
                    @click="deleteBulk"
                  >
                    <i class="fa fa-minus-circle left" />
                    Delete selected
                  </b-button>
                </b-col>
              </b-row>
            </div>
            <b-list-group class="RoleList-list collection">
              <b-list-group-item
                v-for="document in documents"
                data-cy="RoleList-list"
                :key="document.id"
                class="p-2"
              >
                <RoleItem
                  :document="document"
                  :is-checked="isChecked(document.id)"
                  @checkbox-click="toggleSelectDocuments"
                  @common-list::edit-document="editDocument"
                  @delete-document="deleteRole"
                />
              </b-list-group-item>
            </b-list-group>
          </b-card-text>
        </b-card>
        <b-row align-h="center">
          <b-pagination
            class="m-2 mt-4"
            data-cy="RolesManagement-pagination"
            v-model="currentPage"
            :total-rows="totalDocuments"
            :per-page="paginationSize"
          ></b-pagination>
        </b-row>
      </template>
    </template>
    <delete-modal
      id="modal-delete-roles"
      :candidates-for-deletion="candidatesForDeletion"
      :is-loading="deleteModalIsLoading"
      @confirm="onDeleteConfirmed"
      @hide="resetCandidatesForDeletion"
    />
  </div>
</template>

<script>
import DeleteModal from './DeleteModal'
import Filters from './Filters'
import RoleItem from '../Roles/RoleItem'
import * as filterManager from '../../../services/filterManager'
export default {
  name: 'RoleList',
  components: {
    DeleteModal,
    Filters,
    RoleItem
  },
  props: {
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
      candidatesForDeletion: [],
      currentFilter: new filterManager.Filter(),
      currentPage: 1,
      deleteModalIsLoading: false,
      documentToDelete: null,
      documents: [],
      loading: false,
      selectedDocuments: [],
      totalDocuments: 0
    }
  },
  computed: {
    displayBulkDelete() {
      return this.selectedDocuments.length > 0
    },
    paginationFrom() {
      return (this.currentPage - 1) * this.paginationSize || 0
    },
    paginationSize() {
      return 10
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
      this.fetchRoles()
    },
    currentPage() {
      this.fetchRoles()
    }
  },
  mounted() {
    this.currentFilter = Object.assign(
      new filterManager.Filter(),
      filterManager.loadFromRoute(this.$route)
    )
  },
  methods: {
    // DELETE
    // =========================================================================
    async onDeleteConfirmed() {
      this.deleteModalIsLoading = true
      try {
        await this.performDelete(this.candidatesForDeletion)
        this.$bvModal.hide('modal-delete-roles')
        this.deleteModalIsLoading = false
        this.fetchRoles()
      } catch (e) {
        this.$log.error(e)
        this.$bvToast.toast(
          'The complete error has been printed to the console.',
          {
            title:
              'Ooops! Something went wrong while deleting the document(s).',
            variant: 'danger',
            toaster: 'b-toaster-bottom-right',
            appendToast: true
          }
        )
      }
    },
    deleteRole(id) {
      this.candidatesForDeletion.push(id)
      this.$bvModal.show('modal-delete-roles')
    },
    deleteBulk() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(
        this.selectedDocuments
      )
      this.$bvModal.show('modal-delete-roles')
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion = []
    },
    isChecked(id) {
      return this.selectedDocuments.indexOf(id) > -1
    },
    toggleSelectDocuments(id) {
      let index = this.selectedDocuments.indexOf(id)

      if (index === -1) {
        this.selectedDocuments.push(id)
        return
      }

      this.selectedDocuments.splice(index, 1)
    },
    onFiltersUpdated(filter) {
      const newFilters = Object.assign(this.currentFilter, {
        active: filter ? filterManager.ACTIVE_BASIC : filterManager.NO_ACTIVE,
        basic: filter,
        from: 0
      })
      try {
        filterManager.saveToRouter(
          filterManager.stripDefaultValuesFromFilter(newFilters),
          this.$router
        )
      } catch (error) {
        this.$log.error(error)
      }
    },
    fetchRoles() {
      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      this.performSearch(this.currentFilter.basic || {}, pagination)
        .then(res => {
          this.documents = res.documents
          this.totalDocuments = res.total
        })
        .catch(e => {
          this.$log.error(e)
          this.$bvToast.toast(
            'The complete error has been printed to console',
            {
              title: 'Ooops! Something went wrong while fetching the role list',
              variant: 'warning',
              toaster: 'b-toaster-bottom-right',
              appendToast: true,
              dismissible: true,
              noAutoHide: true
            }
          )
        })
    },
    editDocument(route, id) {
      this.$router.push({
        name: this.routeUpdate,
        params: { id }
      })
    },
    create() {
      this.$router.push({ name: this.routeCreate })
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.RoleList-list {
  overflow: visible;
}
</style>
