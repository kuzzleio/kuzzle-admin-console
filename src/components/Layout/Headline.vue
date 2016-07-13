<template>
  <div class="headline">
    <h1 class="left">{{title}}</h1>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    props: ['title']
  }
</script>

<style lang="scss">
  .headline {
    margin-bottom: 80px;

    a.btn {
      margin-top: 5px;
      margin-left: 15px;
    }
  }
</style>