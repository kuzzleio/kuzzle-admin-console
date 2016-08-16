<template>
  <main-menu></main-menu>

  <main class="loader">
    <router-view></router-view>
  </main>
</template>

<style lang="scss" rel="stylesheet/scss" scoped>
  .loader {
    transition: opacity .5s ease-out;
    opacity: 1;

    &.loading {
      opacity: 0.3;

      &:before {
        content: "loading ...";
        position: fixed;
        text-align: center;
        left: 0;
        right: 0;
        bottom: 10px;
      }
    }
  }
</style>

<script>
  import MainMenu from './Materialize/MainMenu'
  export default {
    name: 'Home',
    components: {
      MainMenu
    }
  }
</script>
