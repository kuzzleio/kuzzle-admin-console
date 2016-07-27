<template>
  <div>
    <headline title="Users Management"></headline>

    <div>
      <div class="row">
        <div class="col s10">
          <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
          <a class="btn waves-effect waves-light" :class="displayBulkDelete ? 'red' : 'disabled'"
             @click="$broadcast('modal-open', 'bulk-delete')">
            <i class="fa fa-minus-circle left"></i>
            Delete
          </a>
          <div class="collection">
            <div class="collection-item" transition="collection" v-for="user in documents" >
              <user-item :user="user" @checkbox-click="toggleSelectDocuments"></user-item>
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
  </div>
</template>

<script>
  import Headline from '../../Materialize/Headline'
  import Pagination from '../../Materialize/Pagination'
  import Modal from '../../Materialize/Modal'
  import UserItem from './UserItem'
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
