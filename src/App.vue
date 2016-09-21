<template>
  <div class="toast-error" v-toaster></div>

  <div v-if="!kuzzleIsConnected">
    <kuzzle-disconnected-page></kuzzle-disconnected-page>
  </div>

  <div v-if="kuzzleIsConnected">
    <router-view></router-view>
  </div>
</template>

<script>
import {} from './assets/global.scss'
import Toaster from './directives/Materialize/toaster.directive'
import KuzzleDisconnectedPage from './components/Error/KuzzleDisconnectedPage'
import { switchEnvironment } from './services/environment'
import { kuzzleIsConnected } from './vuex/modules/common/kuzzle/getters'

window.jQuery = window.$ = require('jquery')
require('materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  replace: false,
  directives: [Toaster],
  components: {
    KuzzleDisconnectedPage
  },
  ready () {
    // TODO 
    // App is in charge of initializing the environments.
    //
    // Load existing profiles from LocalStorage
    // if no profiles -> connect to default
    // else if lastConnected ->
    //      if lastConnected !exists -> connect to first one
    //      else connect to lastConnected
    // let environments = loadEnvironments()
    this.switchEnvironment('valid')
  },
  methods: {
    switchEnvironment
  },
  vuex: {
    getters: {
      kuzzleIsConnected
    }
  }
}
</script>
