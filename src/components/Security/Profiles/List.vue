<template>
  <div>
    <headline title="Profiles Management"></headline>

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
            <div v-for="profile in profiles" class="collection-item" transition="collection">
              <profile-item :profile="profile"></profile-item>
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
</template>

<script>
  import ProfileItem from './ProfileItem'
  import Headline from '../../Materialize/Headline'
  import Pagination from '../../Materialize/Pagination'

  export default {
    name: 'ProfilesList',
    components: {
      ProfileItem,
      Headline,
      Pagination
    },
    methods: {
      changePage () {}
    },
    data () {
      return {
        profiles: [
          {
            id: 'profile-id',
            content: {
              roles: [
                'role1', 'role2', 'role3'
              ]
            }
          }
        ]
      }
    }
  }
</script>
