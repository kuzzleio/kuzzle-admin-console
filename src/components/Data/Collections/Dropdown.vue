<template>
  <span>
    <dropdown :id="collection" :myclass="myclass">
      <li><router-link :to="{name: 'DataCollectionEdit', params: {collection: collection, index: index}}">Edit collection</router-link></li>
      <li class="divider"></li>
      <li v-if="!isRealtime"><router-link :to="{name: 'DataDocumentsList', params: {collection: collection, index: index}}">Browse documents</router-link></li>
      <li><router-link :to="{name: 'DataCollectionWatch', params: {collection: collection, index: index}}">Watch messages</router-link></li>
    </dropdown>
  </span>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown'

  export default {
    name: 'CollectionDropdown',
    props: {
      index: String,
      collection: String,
      isRealtime: Boolean,
      'myclass': String
    },
    components: {
      Dropdown
    }
  }
</script>
