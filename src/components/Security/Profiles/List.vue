<template>
  <div class="ProfileList">
    <slot v-if="currentFilter.basic && totalDocuments === 0" name="emptySet" />
    <template v-else>
      <filters
        :current-filter="currentFilter"
        :index="index"
        :collection="collection"
        @filters-updated="onFiltersUpdated"
      />
      <b-card
        class="light-shadow mt-3"
        :bg-variant="documents.length === 0 ? 'light' : 'default'"
      >
        <template v-if="loading">
          <b-row class="text-center">
            <b-col>
              <b-spinner variant="primary" class="mt-5"></b-spinner>
            </b-col>
          </b-row>
        </template>
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
                      href="https://docs.kuzzle.io/guide/1/elasticsearch/"
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
                  data-cy="ProfileList-toggleAllBtn"
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
                  data-cy="ProfileList-bulkDeleteBtn"
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
            data-cy="ProfileList-items"
          >
            <div class="col s12">
              <b-list-group class="w-100">
                <b-list-group-item
                  v-for="document in documents"
                  class="p-2"
                  data-cy="ProfileList-item"
                  :key="document._id"
                >
                  <ProfileItem
                    :document="document"
                    :is-checked="isChecked(document._id)"
                    :index="index"
                    :collection="collection"
                    @checkbox-click="toggleSelectDocuments"
                    @edit="editProfile(document._id)"
                    @delete="deleteProfile"
                  />
                </b-list-group-item>
              </b-list-group>
            </div>
          </div>
        </b-card-text>
      </b-card>
      <b-row align-h="center">
        <b-pagination
          class="m-2 mt-4"
          data-cy="ProfileManagement-pagination"
          v-model="currentPage"
          :total-rows="totalDocuments"
          :per-page="paginationSize"
        ></b-pagination>
      </b-row>
    </template>
    <delete-modal
      id="modal-delete-profiles"
      :candidates-for-deletion="candidatesForDeletion"
      :is-loading="deleteModalIsLoading"
      @confirm="onDeleteConfirmed"
      @hide="resetCandidatesForDeletion"
    />
  </div>
</template>

<script>
import DeleteModal from './DeleteModal'
import ProfileItem from '../Profiles/ProfileItem'
import Filters from './Filters'
import { mapGetters } from 'vuex'

export default {
  name: 'ProfileList',
  components: {
    DeleteModal,
    Filters,
    ProfileItem
  },
  props: {
    index: String,
    collection: String,
    itemName: String,
    displayCreate: {
      type: Boolean,
      default: false
    },
    routeCreate: String,
    routeUpdate: String
  },
  data() {
    return {
      candidatesForDeletion: [],
      currentFilter: [],
      currentPage: 1,
      deleteModalIsLoading: false,
      documents: [],
      loading: true,
      selectedDocuments: [],
      totalDocuments: 0,
      paginationSize: 10,
      itemsPerPage: [10, 25, 50, 100, 500]
    }
  },
  computed: {
    ...mapGetters('kuzzle', ['wrapper']),
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
      return (this.currentPage - 1) * this.paginationSize || 0
    }
  },
  methods: {
    changePaginationSize(e) {
      this.paginationSize = e
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
      this.selectedDocuments = this.documents.map(document => document._id)
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
        this.saveFilterToRoute(newFilters)
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while updating filters',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
    },
    async fetchProfiles() {
      this.loading = true
      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      try {
        const res = await this.wrapper.performSearchProfiles(
          { roles: this.currentFilter } || {},
          pagination
        )
        this.documents = res.documents
        this.totalDocuments = res.total
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while fetching the profiles',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
      this.loading = false
    },
    editProfile(id) {
      this.$router.push({
        name: 'SecurityProfilesUpdate',
        params: { id }
      })
    },

    // DELETE
    // =========================================================================
    async onDeleteConfirmed() {
      this.deleteModalIsLoading = true
      try {
        await this.wrapper.performDeleteProfiles(
          this.index,
          this.collection,
          this.candidatesForDeletion
        )

        this.selectedDocuments = []
        this.fetchProfiles()
      } catch (error) {
        this.$log.error(error)
        this.$bvToast.toast('The complete error has been printed to console', {
          title: 'Ooops! Something went wrong while deleting the profiles',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        })
      }
      this.$bvModal.hide('modal-delete-profiles')
      this.deleteModalIsLoading = false
    },
    deleteBulk() {
      this.candidatesForDeletion = this.candidatesForDeletion.concat(
        this.selectedDocuments
      )
      this.$bvModal.show('modal-delete-profiles')
    },
    deleteProfile(id) {
      this.candidatesForDeletion.push(id)
      this.$bvModal.show('modal-delete-profiles')
    },
    resetCandidatesForDeletion() {
      this.candidatesForDeletion = []
    },

    create() {
      this.$router.push({ name: this.routeCreate })
    },
    loadFilterFromRoute() {
      const filter = this.$route.query.filter
      if (filter && Array.isArray(filter)) {
        this.currentFilter = filter
      }
    },
    saveFilterToRoute(newFilter) {
      this.$router.push({
        query: { filter: newFilter, from: this.paginationFrom }
      })
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler() {
        this.loadFilterFromRoute()
      }
    },
    currentFilter: {
      immediate: true,
      handler() {
        this.fetchProfiles()
      }
    },
    currentPage() {
      this.$router.push({ query: { from: this.paginationFrom } })
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
