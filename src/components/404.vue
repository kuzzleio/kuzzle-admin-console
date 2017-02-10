<template>
  <div>
    <main-menu></main-menu>

    <div class="row center">
      <h1>404 not found</h1>
      <a href="#">Go back to the main page</a>
    </div>
  </div>
</template>

<script>
  import MainMenu from './Common/MainMenu'

  export default {
    name: 'Home',
    components: {
      MainMenu
    }
  }
</script>
