<template>
  <div>
    <headline title="Users Management"></headline>

    <filters
      @filters-quick-search="quickSearch"
      @filters-basic-search="basicSearch"
      @filters-raw-search="rawSearch"
      >
    </filters>

    <div>
      <div class="row">
        <div class="col s10 list-document">
          <div v-if="documents.length">
            <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
            <a class="btn waves-effect waves-light" :class="displayBulkDelete ? 'red' : 'disabled'" @click="$broadcast('modal-open', 'bulk-delete')">
              <i class="fa fa-minus-circle left"></i>
              Delete
            </a>
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
              :current-page="currentPage"
              :limit="limit"
              :total="totalDocuments"
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
  import { documents, totalDocuments, selectedDocuments } from '../../../vuex/modules/collection/getters'
  import { formatFromQuickSearch, formatPagination, formatFromBasicSearch, formatSort } from '../../../services/filterFormat'

  export default {
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
        selectedDocuments
      }
    },
    data () {
      return {
        displayBulkDelete: true,
        currentPage: 1,
        limit: 10
      }
    },
    computed: {
      displayBulkDelete () {
        return this.selectedDocuments.length > 0
      }
    },
    methods: {
      changePage (currentPage) {
        this.$router.go({query: {page: currentPage}})
      },
      confirmBulkDelete () {
        this.$broadcast('modal-close', 'bulk-delete')
        this.deleteUsers(this.selectedDocuments)
          .then(() => {
            this.searchUsers()
          })
      },
      quickSearch (searchTerm) {
        this.performSearch('users', '%kuzzle', formatFromQuickSearch(searchTerm), formatPagination(1, this.limit))
      },
      basicSearch (filters, sorting) {
        this.performSearch('users', '%kuzzle', formatFromBasicSearch(filters), formatPagination(1, this.limit), formatSort(sorting))
      },
      rawSearch (filters) {
        this.performSearch('users', '%kuzzle', filters, formatPagination(1, this.limit))
      }
    },
    route: {
      data () {
        this.currentPage = parseInt(this.$route.query.page) || 1
        this.performSearch('users', '%kuzzle', {}, formatPagination(this.currentPage, this.limit))
      }
    }
  }
</script>
