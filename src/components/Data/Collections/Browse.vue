<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Browse
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <common-browse
      item-name="DocumentItem"
      :collection="collection"
      :index="index"
      @create-clicked="createDocument">

    </common-browse>
  </div>
</template>

<script>
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'
  import CollectionDropdown from '../Collections/Dropdown'

  export default {
    name: 'DocumentBrowse',
    props: {
      collection: String,
      index: String
    },
    components: {
      CommonBrowse,
      Headline,
      CollectionDropdown
    },
    methods: {
      createDocument () {
        this.$router.go({name: 'DataCreateDocument'})
      }
    },
    route: {
      data () {
        // let Vue change props before broadcast the event
        setTimeout(() => {
          this.$broadcast('crudl-refresh-search')
        }, 0)
      }
    }
  }
</script>
