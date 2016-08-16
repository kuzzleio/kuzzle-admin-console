<template>
  <div>
    <headline title="Roles Management"></headline>
    <common-browse item-name="RoleItem" collection="roles" index="%kuzzle"></common-browse>
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
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
