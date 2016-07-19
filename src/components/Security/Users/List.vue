<template>
  <div>
    <headline title="Users Management"></headline>

    <div>
      <div class="row">
        <div class="col s10">
          <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
          <a class="btn waves-effect waves-light" :class="displayBulkDelete ? 'red' : 'disabled'" @click="deleteUsers(selectedDocuments)">
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
      </div>
    </div>
  </div>
</template>

<script>
  import Headline from '../../Layout/Headline'
  import Pagination from '../../Layout/Pagination'
  import Dropdown from '../../Layout/Dropdown'
  import Modal from '../../Layout/Modal'
  import { searchUsers, deleteUser, deleteUsers } from '../../../vuex/modules/collection/users-actions'
  import { toggleSelectDocuments } from '../../../vuex/modules/collection/actions'
  import { documents, totalDocuments, selectedDocuments } from '../../../vuex/modules/collection/getters'

  export default {
    components: {
      Headline,
      Pagination,
      Dropdown,
      Modal
    },
    vuex: {
      actions: {
        searchUsers,
        deleteUser,
        deleteUsers,
        toggleSelectDocuments
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
      selectUser (userId) {
        this.selectedUsers.push(userId)
      }
    },
    route: {
      data () {
        this.currentPage = parseInt(this.$route.query.page) || 1

        this.searchUsers({
          from: this.limit * (this.currentPage - 1),
          size: this.limit
        })
      }
    }

  }
</script>
