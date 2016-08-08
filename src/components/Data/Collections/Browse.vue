<template>
  <div class="wrapper">
    <crudl-document :index="$route.params.index" :collection="$route.params.collection">
      <document-item></document-item>
    </crudl-document>
  </div>
</template>

<script>
  export default {
    name: 'CollectionBrowse'
  }
</script>
