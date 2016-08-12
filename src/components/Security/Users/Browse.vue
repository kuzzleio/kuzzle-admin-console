<template>
  <div>
    <headline title="Users Management"></headline>
    <common-browse :item-name="item"></common-browse>
  </div>
</template>

<script>
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'UsersBrowse',
    data () {
      return {
        item: 'UserItem'
      }
    },
    components: {
      CommonBrowse,
      Headline
    }
  }
</script>
