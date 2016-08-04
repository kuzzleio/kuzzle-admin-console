<template>
  <div class="wrapper">
    <crudl-document :index="$route.params.index" :collection="$route.params.collection">
      <document-item></document-item>
    </crudl-document>
  </div>
</template>

<script>
  import CrudlDocument from '../../Common/CrudlDocument'
  import DocumentItem from './DocumentItem.vue'

  export default {
    name: 'CollectionBrowse',
    components: {
      CrudlDocument,
      DocumentItem
    }
  }
</script>
