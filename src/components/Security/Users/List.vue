<template>
  <div>
    <headline>Users Management</headline>

    <common-list
      item-name="UserItem"
      collection="users"
      index="%kuzzle"
      @create-clicked="createUser">

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
            <button v-link="{name: 'SecurityUsersCreate'}"
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

  export default {
    name: 'UsersList',
    components: {
      CommonList,
      Headline
    },
    methods: {
      createUser () {
        this.$router.go({name: 'SecurityUsersCreate'})
      }
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
