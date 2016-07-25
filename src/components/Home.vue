<template>
  <main-menu></main-menu>

  <main>
    <router-view></router-view>
  </main>
</template>

<script>
  import MainMenu from './Materialize/MainMenu'
  export default {
    components: {
      MainMenu
    }
  }
</script>
