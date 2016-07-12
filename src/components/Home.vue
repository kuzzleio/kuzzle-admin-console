<template>
  <main-menu></main-menu>

  <main>
    <router-view></router-view>
  </main>
</template>

<script>
  import MainMenu from './Layout/MainMenu'
  export default {
    components: {
      MainMenu
    },
    ready () {
      console.log(MainMenu)
    }
  }
</script>
