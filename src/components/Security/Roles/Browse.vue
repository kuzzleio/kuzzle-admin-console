<template>
  <div>
    <headline title="Roles Management"></headline>
    <common-browse
      item-name="RoleItem"
      collection="roles"
      index="%kuzzle"
      @create-clicked="createRole">

    </common-browse>
  </div>
</template>

<script>
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'RolesBrowse',
    components: {
      CommonBrowse,
      Headline
    },
    methods: {
      createRole () {
        this.$router.go({name: 'SecurityCreateRole'})
      }
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
