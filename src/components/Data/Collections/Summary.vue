<template>
  <div class="wrapper">
    <headline>
      {{collection}}
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <collection-tabs></collection-tabs>

    <div class="card-panel">
      Summary
    </div>
  </div>
</template>

<script>
  import CollectionTabs from './Tabs'
  import CollectionDropdown from '../Collections/Dropdown'
  import Headline from '../../Materialize/Headline'

  export default {
    name: 'CollectionSummary',
    props: {
      index: String,
      collection: String
    },
    components: {
      CollectionTabs,
      CollectionDropdown,
      Headline
    }
  }
</script>
