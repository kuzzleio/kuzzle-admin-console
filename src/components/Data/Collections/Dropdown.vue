<template>
  <span>
    <dropdown :id="collection" :class="class">
      <li><a v-link="{name: 'DataCollectionEdit', params: {collection: collection, index: index}}">Edit collection</a></li>
      <li class="divider"></li>
      <li v-if="!isRealtime"><a v-link="{name: 'DataDocumentsList', params: {collection: collection, index: index}}">Browse documents</a></li>
      <li><a v-link="{name: 'DataCollectionWatch', params: {collection: collection, index: index}}">Watch messages</a></li>
    </dropdown>
  </span>
</template>


<script>
  import Dropdown from '../../Materialize/Dropdown.vue'

  export default {
    name: 'CollectionDropdown',
    props: {
      index: String,
      collection: String,
      isRealtime: Boolean,
      'class': String
    },
    components: {
      Dropdown
    }
  }
</script>
