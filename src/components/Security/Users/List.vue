<template>
  <div>
    <headline title="Users Management"></headline>
    <common-list
      item-name="UserItem"
      collection="users"
      index="%kuzzle"
      @create-clicked="createUser">

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
