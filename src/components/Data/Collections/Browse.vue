<template>
  <div class="wrapper">
    <headline>
      {{collection}} - Browse
      <collection-dropdown class="icon-medium icon-black" :index="index" :collection="collection"></collection-dropdown>
    </headline>

    <div class="nav">
      <ul>
        <li>
          <a href="#!" v-link="{name: 'DataCollectionBrowse', params: {index: index, collection: collection}, strict: true}">
            Browse
          </a>
        </li>
        <li>
          <a href="#!" v-link="{name: 'DataCollectionWatch', params: {index: index, collection: collection}}">
            Watch
          </a>
        </li>
        <li>
          <a href="#!" v-link="{name: 'DataCollectionSummary', params: {index: index, collection: collection}}">
            Summary
          </a>
        </li>
      </ul>
    </div>

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

<style rel="stylesheet/scss" lang="scss" scoped>
  .nav li {
    display: inline-block;
    a {
      padding: 10px 8px;
      text-transform: uppercase;
      color: #666;
      letter-spacing: 1px;
      margin: 0 10px;

      &.v-link-active {
        border-bottom: solid 2px #00757F;
      }
    }
  }
</style>

<script>
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
