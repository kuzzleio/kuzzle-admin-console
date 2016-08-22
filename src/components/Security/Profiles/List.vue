<template>
  <div>
    <headline title="Profiles Management"></headline>
    <common-list
      item-name="ProfileItem"
      collection="profiles"
      index="%kuzzle"
      @create-clicked="createProfile">

    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'ProfilesList',
    components: {
      CommonList,
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
