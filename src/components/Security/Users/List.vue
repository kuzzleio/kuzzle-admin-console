<template>
  <div>
    <headline>Users Management</headline>

    <!-- Not allowed -->
    <div class="card-panel" v-if="!canSearchUser()">
      <div class="row valign-bottom empty-set empty-set-condensed">
        <div class="col s1 offset-s1">
          <i class="fa fa-6x fa-lock grey-text text-lighten-1" aria-hidden="true"></i>
        </div>
        <div class="col s10">
          <p>
            You are not allowed to access the users list<br>
          </p>
          <p>
            <em>Learn more about security &amp; permissions on <a href="http://kuzzle.io/guide/#permissions" target="_blank">http://kuzzle.io/guide</a></em>
          </p>
        </div>
      </div>
    </div>

    <common-list
      v-if="canSearchUser()"
      item-name="UserItem"
      collection="users"
      index="%kuzzle"
      @create-clicked="createUser"
      :display-create="canCreateUser()">

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
            <button :disabled="!canCreateUser()"
                    :class="!canCreateUser() ? 'disabled' : ''"
                    title="{{!canCreateUser() ? 'You are not allowed to create new users' : ''}}"
                    v-link="{name: 'SecurityUsersCreate'}"
                    class="btn primary waves-effect waves-light">
              <i class="fa fa-plus-circle left"></i>
              Create a user
            </button>
          </div>
        </div>
      </div>
    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'
  import { canSearchUser, canCreateUser } from '../../../services/userAuthorization'

  export default {
    name: 'UsersList',
    components: {
      CommonList,
      Headline
    },
    methods: {
      createUser () {
        this.$router.go({name: 'SecurityUsersCreate'})
      },
      canSearchUser,
      canCreateUser
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
