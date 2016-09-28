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
import {
  switchEnvironment,
  loadLastConnectedEnvId
} from './services/environment'
import { kuzzleIsConnected, environments } from './vuex/modules/common/kuzzle/getters'
import { loadEnvironments } from './vuex/modules/common/kuzzle/actions'

window.jQuery = window.$ = require('jquery')
require('materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  replace: false,
  directives: [Toaster],
  components: {
    KuzzleDisconnectedPage,
    ErrorLayout
  },
  ready () {
    this.loadEnvironments()
    let lastConnected = this.loadLastConnectedEnvId()

    if (!this.environments[lastConnected]) {
      lastConnected = Object.keys(this.environments)[0]
    }

    this.switchEnvironment(lastConnected)
      .then(() => {
        this.$router.go('/')
      })
      .catch((err) => {
        // TODO bubble this error to the UI
        console.error(`Something went wrong. Not been able to connect to the
          ${lastConnected} environment`)
        console.error(err)
      })
  },
  methods: {
    switchEnvironment,
    loadLastConnectedEnvId
  },
  vuex: {
    getters: {
      kuzzleIsConnected,
      environments
    },
    actions: {
      loadEnvironments
    }
  }
}
</script>
