<template>
  <div>
    <headline title="Roles Management"></headline>
    <common-browse
      item-name="ProfileItem"
      collection="profiles"
      index="%kuzzle"
      @create-clicked="createProfile">

    </common-browse>
  </div>
</template>

<script>
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'ProfilesBrowse',
    components: {
      CommonBrowse,
      Headline
    },
    methods: {
      createProfile () {
        this.$router.go({name: 'SecurityProfilesCreate'})
      }
    },
    route: {
      data () {
        this.$broadcast('crudl-refresh-search')
      }
    }
  }
</script>
