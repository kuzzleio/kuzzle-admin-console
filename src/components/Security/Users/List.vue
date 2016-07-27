<template>
  <div>
    <headline title="Users Management"></headline>

    <filters
      @filters-quick-search="quickSearch"
      @filters-basic-search="basicSearch"
      @filters-raw-search="rawSearch"
      :init-search="initSearch"
      >
    </filters>

    <div>
      <div class="row">
        <div class="col s10 list-document">
          <div v-if="documents.length">
            <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
            <button
              class="btn waves-effect waves-light"
              :class="displayBulkDelete ? 'red' : 'disabled'"
              :disabled="!displayBulkDelete"
              @click="$broadcast('modal-open', 'bulk-delete')">
                <i class="fa fa-minus-circle left"></i>
                Delete
            </button>
            <div class="collection">
              <div v-for="user in documents" class="collection-item" transition="collection">
                <input
                  type="checkbox"
                  class="filled-in"
                  id="checkbox-{{user.id}}"
                  value="{{user.id}}"
                  @click="toggleSelectDocuments(user.id)"/>

                <label for="checkbox-{{user.id}}" >{{user.id}}</label>
                <label v-if="user.additionalAttribute && user.additionalAttribute.value" class="additional-attribute">
                  ({{user.additionalAttribute.name}}: {{user.additionalAttribute.value}})
                </label>
                <div class="right actions">
                  <a class="action fa fa-pencil"></a>
                  <dropdown :id="user.id">
                    <li><a @click="deleteUser(user.id)">Delete</a></li>
                  </dropdown>
                </div>
              </div>
            </div>

            <pagination
              @change-page="changePage"
              :total="totalDocuments"
              :from="paginationFrom"
              :size="paginationSize"
            ></pagination>
          </div>

          <div v-if="!documents.length" class="no-document">
            There is no user corresponding to your search!
          </div>
        </div>
      </div>
    </div>

    <modal id="bulk-delete">
      <h4>Users deletion</h4>
      <p>Do you really want to delete {{selectedDocuments.length}} users?</p>

      <span slot="footer">
        <button
          href="#"
          class="waves-effect waves-green btn red"
          @click="confirmBulkDelete()">
            I'm sure!
        </button>
        <button href="#" class="btn-flat" @click.prevent="$broadcast('modal-close', 'bulk-delete')">
            Cancel
        </button>
    </span>
    </modal>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import Pagination from '../../Materialize/Pagination'
  import Dropdown from '../../Materialize/Dropdown'
  import Modal from '../../Materialize/Modal'
  import Filters from '../../Common/Filters'
  import { deleteUser, deleteUsers } from '../../../vuex/modules/collection/users-actions'
  import { toggleSelectDocuments, performSearch } from '../../../vuex/modules/collection/actions'
  import { documents, totalDocuments, selectedDocuments, paginationFrom, paginationSize } from '../../../vuex/modules/collection/getters'
  import { formatFromQuickSearch, formatFromBasicSearch, formatSort } from '../../../services/filterFormat'

  export default {
    name: 'UsersList',
    components: {
      Headline,
      Pagination,
      Dropdown,
      Modal,
      Filters
    },
    vuex: {
      actions: {
        deleteUser,
        deleteUsers,
        toggleSelectDocuments,
        performSearch
      },
      getters: {
        documents,
        totalDocuments,
        selectedDocuments,
        paginationFrom,
        paginationSize
      }
    },
    data () {
      return {
        displayBulkDelete: true,
        initSearch: {}
      }
    },
    computed: {
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      }
    },
    methods: {
      changePage (from) {
        this.$router.go({query: {from}})
      },
      confirmBulkDelete () {
        this.$broadcast('modal-close', 'bulk-delete')
        this.deleteUsers(this.selectedDocuments)
          .then(() => {
            this.searchUsers()
          })
      },
      quickSearch (searchTerm) {
        this.$router.go({query: {quickSearch: searchTerm, from: 0}})
      },
      basicSearch (filters, sorting) {
        let basic = JSON.stringify({filters, sorting})
        this.$router.go({query: {basicSearch: basic, from: 0}})
      },
      rawSearch (filters) {
        let rawSearch = JSON.stringify(filters)
        this.$router.go({query: {rawSearch, from: 0}})
      }
    },
    route: {
      data () {
        let filters = {}
        let sorting = {}

        // Manage query quickSearch/basicSearch/rawSearch
        try {
          if (this.$route.query.quickSearch) {
            filters = formatFromQuickSearch(this.$route.query.quickSearch)
            this.initSearch = {quickSearch: this.$route.query.quickSearch}
          } else if (this.$route.query.basicSearch) {
            let basicSearch = JSON.parse(this.$route.query.basicSearch)
            filters = formatFromBasicSearch(basicSearch.filters)
            sorting = basicSearch.sorting
            this.initSearch = {basicSearch}
          } else if (this.$route.query.rawSearch) {
            filters = JSON.parse(this.$route.query.rawSearch)
            this.initSearch = {rawSearch: filters}
          }
        } catch (e) {
          this.initSearch = {}
        }

        // Manage pagination
        this.currentPage = parseInt(this.$route.query.page) || 1

        // Execute search with corresponding filters
        this.performSearch('users', '%kuzzle', filters, formatSort(sorting))
      }
    }
  }
</script>
