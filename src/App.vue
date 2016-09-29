<template>
  <div class="toast-error" v-toaster></div>

  <div v-if="!kuzzleIsConnected">
    <error-layout>
      <kuzzle-disconnected-page></kuzzle-disconnected-page>
    </error-layout>
  </div>

  <div v-if="kuzzleIsConnected">
    <router-view></router-view>
  </div>
</template>

<script>
import {} from '../bower_components/ace-builds/src-min-noconflict/ace.js'
import {} from '../bower_components/ace-builds/src-min-noconflict/theme-tomorrow.js'
import {} from '../bower_components/ace-builds/src-min-noconflict/mode-json.js'

import {} from './assets/global.scss'
import Toaster from './directives/Materialize/toaster.directive'
import KuzzleDisconnectedPage from './components/Error/KuzzleDisconnectedPage'
import ErrorLayout from './components/Error/Layout'
import { switchEnvironment } from './services/environment'
import { kuzzleIsConnected } from './vuex/modules/common/kuzzle/getters'

window.jQuery = window.$ = require('jquery')
require('imports?$=jquery!materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  replace: false,
  directives: [Toaster],
  components: {
    KuzzleDisconnectedPage,
    ErrorLayout
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
      .catch((err) => {
        console.error('Something went wrong. Not been able to connect to the selected environment')
        console.error(err)
      })
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
