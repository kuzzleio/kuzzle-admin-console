<template>
  <div>
    <headline title="Users Management"></headline>
    <common-browse item-name="UserItem" collection="users" index="%kuzzle"></common-browse>
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
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
