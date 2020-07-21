<template>
  <div class="UserList">
    <template v-if="loading">
      <b-row class="text-center">
        <b-col>
          <b-spinner variant="primary" class="mt-5"></b-spinner>
        </b-col>
      </b-row>
    </template>
    <slot v-if="isCollectionEmpty" name="emptySet" />
    <template v-if="!isCollectionEmpty && !loading">
      <b-row class="justify-content-md-center" no-gutters>
        <b-col cols="12">
          <filters
            class="mb-3"
            :available-operands="searchFilterOperands"
            :current-filter="currentFilter"
            :collection-mapping="collectionMapping"
            :index="index"
            :collection="collection"
            @filters-updated="onFiltersUpdated"
            @reset="onFiltersUpdated"
          />
        </b-col>
      </b-row>
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
                  variant="outline-dark"
                  class="mr-2"
                  data-cy="UserList-toggleAllBtn"
                  @click="toggleAll"
                >
                  <i
                    :class="
                      `far ${allChecked ? 'fa-check-square' : 'fa-square'} left`
                    "
                  />
                  Toggle all
                </b-button>
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
              <b-col cols="4" class="text-right"
                >Show
                <b-form-select
                  class="mx-2"
                  style="width: unset"
                  :options="itemsPerPage"
                  :value="paginationSize"
                  @change="changePaginationSize($event)"
                >
                </b-form-select>
                <span v-if="totalDocuments"
                  >of {{ totalDocuments }} total items.</span
                ></b-col
              >
            </b-row>
          </div>
          <div
            v-show="documents.length"
            class="row CrudlDocument-collection"
            data-cy="UserList-items"
          >
            <div class="col s12">
              <b-list-group class="w-100">
                <b-list-group-item
                  v-for="document in documents"
                  class="p-2"
                  data-cy="UserList-item"
                  :key="document.id"
                >
                  <UserItem
                    :document="document"
                    :is-checked="isChecked(document.id)"
                    :index="index"
                    :collection="collection"
                    @checkbox-click="toggleSelectDocuments"
                    @edit="editUser"
                    @delete="deleteUser"
                  />
                </b-list-group-item>
              </b-list-group>
            </div>
          </div>
        </b-card-text>
      </b-card>
      <b-row align-h="center" v-if="!loading">
        <b-pagination
          class="m-2 mt-4"
          data-cy="UserManagement-pagination"
          v-model="currentPage"
          :total-rows="totalDocuments"
          :per-page="paginationSize"
        ></b-pagination>
      </b-row>
      <delete-modal
        id="modal-delete-users"
        :candidates-for-deletion="candidatesForDeletion"
        :is-loading="deleteModalIsLoading"
        @confirm="onDeleteConfirmed"
        @hide="resetCandidatesForDeletion"
      />
    </template>
  </div>
</template>

<script>
import DeleteModal from './DeleteModal'
import Filters from '../../Common/Filters/Filters'
import UserItem from './UserItem'
import * as filterManager from '../../../services/filterManager'
import { mapGetters } from 'vuex'

export default {
  name: 'UserList',
  components: {
    DeleteModal,
    Filters,
    UserItem
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
    routeUpdate: String,
    collectionMapping: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      currentFilter: new filterManager.Filter(),
      currentPage: 1,
      deleteModalIsLoading: false,
      documents: [],
      loading: true,
      searchFilterOperands: filterManager.searchFilterOperands,
      selectedDocuments: [],
      totalDocuments: 0,
      candidatesForDeletion: [],
      paginationSize: 10,
      itemsPerPage: [10, 25, 50, 100, 500]
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper']),
    isDocumentListFiltered() {
      return this.currentFilter.active !== filterManager.NO_ACTIVE
    },
    isCollectionEmpty() {
      return !this.isDocumentListFiltered && this.totalDocuments === 0
    },
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
    }
  },
  methods: {
    changePaginationSize(e) {
      this.paginationSize = e
      this.fetchDocuments()
    },
    isChecked(id) {
      return this.selectedDocuments.includes(id)
    },
    toggleAll() {
      if (this.allChecked) {
        this.selectedDocuments = []
        return
      }
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
    onFiltersUpdated(newFilters, isLoadHistory) {
      try {
        filterManager.save(
          newFilters,
          this.$router,
          this.index,
          this.collection
        )
        if (!isLoadHistory) {
          filterManager.newHistoyLocalStorage(
            newFilters,
            this.index,
            this.collection
          )
        }
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while updating the filters',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    },
    async fetchDocuments() {
      this.loading = true

      this.$forceUpdate()

      this.selectedDocuments = []

      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      let searchQuery = null
      searchQuery = filterManager.toSearchQuery(
        this.currentFilter,
        this.collectionMapping,
        this.wrapper
      )
      if (!searchQuery) {
        searchQuery = {}
      }

      const sorting = filterManager.toSort(this.currentFilter)

      // TODO: refactor how search is done
      // Execute search with corresponding searchQuery
      try {
        const res = await this.wrapper.performSearchUsers(
          this.collection,
          this.index,
          searchQuery,
          pagination,
          sorting
        )
        this.documents = res.documents
        this.totalDocuments = res.total
      } catch (error) {
        this.$log.error(error)
        this.$log.debug(error.stack)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while fetching users.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
      this.loading = false
    },
    editUser(id) {
      this.$router.push({
        name: 'SecurityUsersUpdate',
        params: { id }
      })
    },

    // DELETE
    // =========================================================================
    async onDeleteConfirmed() {
      this.deleteModalIsLoading = true
      this.loading = true
      try {
        await this.wrapper.performDeleteUsers(
          this.index,
          this.collection,
          this.candidatesForDeletion
        )
        this.deleteModalIsLoading = false
        this.$bvModal.hide('modal-delete-users')
        await this.fetchDocuments()
        if (this.$store.direct.getters.auth.adminAlreadyExists) {
          try {
            await this.$store.direct.dispatch.auth.checkFirstAdmin()
          } catch (err) {
            this.$log.error(err)
            this.setError(err.message)
          }
        }
      } catch (e) {
        this.$log.error(e)
        this.deleteModalIsLoading = false
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
      this.loading = false
    },
    deleteUser(id) {
      this.candidatesForDeletion.push(id)
      this.$bvModal.show('modal-delete-users')
    },
    deleteBulk() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(
        this.selectedDocuments
      )
      this.$bvModal.show('modal-delete-users')
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion = []
    },
    create() {
      this.$router.push({ name: this.routeCreate })
    }
  },
  mounted() {
    this.currentFilter = filterManager.load(
      this.index,
      this.collection,
      this.$route
    )
    filterManager.save(
      this.currentFilter,
      this.$router,
      this.index,
      this.collection
    )
  },
  watch: {
    $route: {
      immediate: false,
      handler(newValue) {
        this.currentFilter = filterManager.load(
          this.index,
          this.collection,
          newValue
        )
        filterManager.save(
          this.currentFilter,
          this.$router,
          this.index,
          this.collection
        )
      }
    },
    currentFilter() {
      this.fetchDocuments()
    },
    currentPage: {
      handler(value) {
        const from = (value - 1) * this.paginationSize
        this.onFiltersUpdated(
          Object.assign(this.currentFilter, {
            from
          })
        )
      }
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped></style>
