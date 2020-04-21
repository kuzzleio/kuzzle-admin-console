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
                    variant="outline-dark"
                    class="mr-2"
                    data-cy="UserList-toggleAllBtn"
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
                :key="document.id"
                class="p-2"
              >
                <RoleItem
                  :document="document"
                  :is-checked="isChecked(document.id)"
                  @checkbox-click="toggleSelectDocuments"
                  @common-list::edit-document="editDocument"
                  @delete-document="deleteDocument"
                />
              </b-list-group-item>
            </b-list-group>
          </b-card-text>
        </b-card>
        <!-- <crudl-document
      v-else
      :pagination-from="paginationFrom"
      :pagination-size="paginationSize"
      :current-filter="currentFilter"
      :documents="documents"
      :total-documents="totalDocuments"
      :display-bulk-delete="displayBulkDelete"
      :display-create="displayCreate"
      :all-checked="allChecked"
      :selected-documents="selectedDocuments"
      :length-document="selectedDocuments.length"
      :document-to-delete="documentToDelete"
      :perform-delete="deleteRoles"
      @filters-updated="onFiltersUpdated"
      @create-clicked="create"
      @toggle-all="toggleAll"
    > -->
      </template>
      <!-- </crudl-document> -->
    </template>
  </div>
</template>

<script>
import Filters from './Filters'
import RoleItem from '../Roles/RoleItem'
import * as filterManager from '../../../services/filterManager'
export default {
  name: 'RoleList',
  components: {
    RoleItem,
    Filters
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
      currentFilter: new filterManager.Filter(),
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
    async deleteRoles(index, collection, ids) {
      await this.performDelete(index, collection, ids)
      this.$set(
        this.selectedDocuments,
        this.selectedDocuments.splice(0, this.selectedDocuments.length)
      )
      this.fetchRoles()
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
.RoleList-list {
  overflow: visible;
}
</style>
