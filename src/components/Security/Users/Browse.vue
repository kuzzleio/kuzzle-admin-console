<template>
  <div>
    <headline title="Users Management"></headline>
    <common-browse
      item-name="UserItem"
      collection="users"
      index="%kuzzle"
      @create-clicked="createUser">

    </common-browse>
  </div>
</template>

<script>
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'UsersBrowse',
    components: {
      CommonBrowse,
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
