<template>
  <div class="ProfileList">
    <template v-if="loading">
      <b-row class="text-center">
        <b-col>
          <b-spinner variant="primary" class="mt-5"></b-spinner>
        </b-col>
      </b-row>
    </template>
    <template v-else>
      <slot
        v-if="currentFilter.basic && totalDocuments === 0"
        name="emptySet"
      />
      <template v-else>
        <filters
          :current-filter="currentFilter"
          @filters-updated="onFiltersUpdated"
        />
        <b-card
          class="light-shadow mt-3"
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
                        `far ${
                          allChecked ? 'fa-check-square' : 'fa-square'
                        } left`
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
                    :key="document.id"
                  >
                    <ProfileItem
                      :document="document"
                      :is-checked="isChecked(document.id)"
                      :index="index"
                      :collection="collection"
                      @checkbox-click="toggleSelectDocuments"
                      @edit="editProfile"
                      @delete="deleteProfile"
                    />
                  </b-list-group-item>
                </b-list-group>
              </div>
            </div>
          </b-card-text>
        </b-card>
      </template>
    </template>
  </div>
</template>

<script>
import ProfileItem from '../Profiles/ProfileItem'
import Filters from './Filters'

export default {
  name: 'ProfileList',
  components: {
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
      currentFilter: []
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
      // newFilters
      try {
        this.$log.debug(newFilters)
        this.saveFilterToRoute(newFilters)
        // filterManager.saveToRouter(
        //   filterManager.stripDefaultValuesFromFilter(newFilters),
        //   this.$router
        // )
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
    fetchProfiles() {
      let pagination = {
        from: this.paginationFrom,
        size: this.paginationSize
      }

      // Execute search with corresponding filters
      this.performSearch({ roles: this.currentFilter } || {}, pagination) // TODO
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
    },
    loadFilterFromRoute() {
      const filter = this.$route.query.filter
      if (filter && Array.isArray(filter)) {
        this.currentFilter = filter
      }
    },
    saveFilterToRoute(newFilter) {
      this.$router.push({ query: { filter: newFilter } })
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
    }
  }
}
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
.ProfileList-list {
  overflow: visible;
}
</style>
