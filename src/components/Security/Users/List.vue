<template>
  <div>
    <headline title="Users Management">
      <a class="btn waves-effect waves-light"><i class="fa fa-plus-circle left"></i>Create</a>
    </headline>

    <div class="container">
      <div class="row">
        <div class="col12">
          <div class="collection">
            <div v-for="user in documents" class="collection-item" transition="collection">
              {{user.content.username}}

              <div class="right actions">
                <a class="action fa fa-pencil"></a>
                <dropdown :id="user.id">
                  <li><a @click="deleteUser(user)">Delete</a></li>
                </dropdown>
              </div>
            </div>
          </div>

          <pagination
            :change-page="changePage"
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
  import { searchUsers, deleteUser } from '../../../vuex/modules/collection/users-actions'
  import { documents, totalDocuments } from '../../../vuex/modules/collection/getters'

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
        deleteUser
      },
      getters: {
        documents,
        totalDocuments
      }
    },
    data () {
      return {
        currentPage: 1,
        limit: 10
      }
    },
    events: {
      'change-page' (currentPage) {
        this.$router.go({query: {page: currentPage + 1}})
      }
    },
    route: {
      data () {
        this.currentPage = parseInt(this.$route.query.page) || 1

        this.searchUsers({
          from: this.limit * this.currentPage,
          size: this.limit
        })
      }
    }

  }
</script>
