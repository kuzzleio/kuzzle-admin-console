<template>
  <main-menu></main-menu>

  <main>
    <router-view></router-view>
  </main>
</template>

<script>
import kuzzle from '../services/kuzzle'
import MainMenu from './Layout/MainMenu'

export default {
  components: {
    MainMenu
  },
  ready () {
    console.dir(kuzzle)
  }
}
</script>
