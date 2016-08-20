<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <div class="card-panel">
      <common-browse
        item-name="DocumentItem"
        :collection="collection"
        :index="index"
        @create-clicked="createDocument">

      </common-browse>
    </div>
  </div>
</template>

<script>
  import CollectionTabs from './Tabs'
  import CommonBrowse from '../../Common/Browse'
  import Headline from '../../Materialize/Headline'
  import CollectionDropdown from '../Collections/Dropdown'

  export default {
    name: 'DocumentBrowse',
    props: {
      index: String,
      collection: String
    },
    components: {
      CollectionTabs,
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
