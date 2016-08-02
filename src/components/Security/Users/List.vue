<template>
  <div>
    <headline title="Users Management"></headline>
    <div>
      <div class="row">
        <div class="col s10">
          <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
          <a class="btn waves-effect waves-light" :class="enableBulkDelete ? 'red' : 'disabled'"
             @click="$broadcast('modal-open', 'bulk-delete')">
            <i class="fa fa-minus-circle left"></i>
            Delete
          </a>
          <div class="collection">
            <div class="collection-item" transition="collection" v-for="user in documents" >
              <user-item
                :user="user"
                @checkbox-click="toggleSelectDocuments"
                @delete-click="userDeletePromptConfirm"
              ></user-item>
            </div>
          </div>

          <pagination
            @change-page="changePage"
            :current-page="currentPage"
            :limit="limit"
            :total="totalDocuments"
          ></pagination>
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

    <modal id="user-delete">
      <h4>Users deletion</h4>
      <p>Do you really want to delete the user {{userToDelete.id}}?</p>
      <pre v-json-formatter="userToDelete.content"></pre>
      <span slot="footer">
        <button
          href="#"
          class="waves-effect waves-green btn red"
          @click="confirmUserDelete(userIdToDelete)">
            I'm sure!
        </button>
        <button href="#" class="btn-flat" @click.prevent="$broadcast('modal-close', 'user-delete')">
            Cancel
        </button>
      </span>
    </modal>
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import Pagination from '../../Materialize/Pagination'
  import Modal from '../../Materialize/Modal'
  import UserItem from './UserItem'
  import jsonFormatter from '../../../directives/json-formatter.directive'
  import {searchUsers, deleteUser, deleteUsers} from '../../../vuex/modules/collection/users-actions'
  import {toggleSelectDocuments, setPagination} from '../../../vuex/modules/collection/actions'
  import {documents, totalDocuments, selectedDocuments} from '../../../vuex/modules/collection/getters'

  export default {
    name: 'UsersList',
    components: {
      Headline,
      UserItem,
      Pagination,
      Modal
    },
    directives: {
      jsonFormatter
    },
    vuex: {
      actions: {
        searchUsers,
        deleteUser,
        deleteUsers,
        toggleSelectDocuments,
        setPagination
      },
      getters: {
        documents,
        totalDocuments,
        selectedDocuments
      }
    },
    data () {
      return {
        enableBulkDelete: true,
        currentPage: 1,
        limit: 10,
        userToDelete: {
          id: null,
          name: null
        }
      }
    },
    computed: {
      enableBulkDelete () {
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
          .catch((error) => {
            console.error(error)
            // TODO call setError action here
          })
      },
      userDeletePromptConfirm (user) {
        this.userToDelete = user
        this.$broadcast('modal-open', 'user-delete')
      },
      confirmUserDelete () {
        this.$broadcast('modal-close', 'user-delete')
        this.deleteUser(this.userToDelete.id)
          .then(() => {
            this.searchUsers()
          })
          .catch(() => {
            // TODO call setError action here
          })
      }
    },
    route: {
      data () {
        this.currentPage = parseInt(this.$route.query.page) || 1
        this.setPagination(this.currentPage, this.limit)
        this.searchUsers()
      }
    }
  }
</script>
