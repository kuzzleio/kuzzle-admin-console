<template>
  <div>
    <headline title="Roles Management"></headline>
    <common-list
      item-name="RoleItem"
      collection="roles"
      index="%kuzzle"
      @create-clicked="createRole">

    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'RolesList',
    components: {
      CommonList,
      Headline
    },
    methods: {
      createRole () {
        this.$router.go({name: 'SecurityRolesCreate'})
      }
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
