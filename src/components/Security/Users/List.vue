<template>
  <div>
    <headline>Users Management</headline>

    <!-- Not allowed -->
    <list-not-allowed v-if="!canSearchUser()"></list-not-allowed>

    <common-list
      v-if="canSearchUser()"
      item-name="UserItem"
      collection="users"
      index="%kuzzle"
      @create-clicked="createUser"
      :display-create="canCreateUser()"
      :perform-search="performSearchUsers">

      <div slot="emptySet" class="card-panel">
        <div class="row valign-bottom empty-set">
          <div class="col s1 offset-s1">
            <i class="fa fa-6x fa-user grey-text text-lighten-1" aria-hidden="true"></i>
          </div>
          <div class="col s10">
            <p>
              Here you'll see the kuzzle's users<br/>
              <em>Currently there is no user.</em>
            </p>
            <router-link :disabled="!canCreateUser()"
                    :class="!canCreateUser() ? 'disabled' : ''"
                    :title="!canCreateUser() ? 'You are not allowed to create new users' : ''"
                    to="{name: 'SecurityUsersCreate'}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a user
            </router-link>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import ListNotAllowed from '../../Common/ListNotAllowed'
  import Headline from '../../Materialize/Headline'
  import { canSearchUser, canCreateUser } from '../../../services/userAuthorization'
  import { performSearchUsers } from '../../../services/kuzzleWrapper'

  export default {
    name: 'UsersList',
    components: {
      ListNotAllowed,
      CommonList,
      Headline
    },
    methods: {
      createUser () {
        this.$router.push({name: 'SecurityUsersCreate'})
      },
      canSearchUser,
      canCreateUser,
      performSearchUsers
    },
    route: {
      data () {
        this.$emit('crudl-refresh-search')
      }
    }
  }
</script>
