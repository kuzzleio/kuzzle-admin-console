<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Browse
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <common-list
      item-name="DocumentItem"
      :collection="collection"
      :index="index"
      @create-clicked="createDocument">

    </common-list>
  </div>
</template>

<script>
  import CommonList from '../../Common/List'
  import Headline from '../../Materialize/Headline'
  import CollectionDropdown from '../Collections/Dropdown'

  export default {
    name: 'DocumentsList',
    props: {
      index: String,
      collection: String
    },
    components: {
      CommonList,
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
