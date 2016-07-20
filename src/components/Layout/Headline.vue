<template>
  <div class="headline">
    <h1>{{title}}</h1>
  </div>
</template>

<script>
  export default {
    props: ['title']
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .headline {
    margin-bottom: 60px;

    a.btn {
      margin-top: 5px;
      margin-left: 15px;
    }
  }
</style>