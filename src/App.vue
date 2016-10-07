<template>
  <div class="toast-error" v-toaster></div>

  <div v-if="!kuzzleIsConnected">
    <error-layout>
      <kuzzle-disconnected-page
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment">
      </kuzzle-disconnected-page>
    </error-layout>
  </div>

  <div v-if="kuzzleIsConnected">
    <router-view
      @environment::create="editEnvironment"
      @environment::delete="deleteEnvironment">
    </router-view>
  </div>

  <modal-create :environment-id="environmentId"></modal-create>
  <modal-delete :environment-id="environmentId"></modal-delete>
</template>

<script>
import {} from '../bower_components/ace-builds/src-min-noconflict/ace.js'
import {} from '../bower_components/ace-builds/src-min-noconflict/theme-tomorrow.js'
import {} from '../bower_components/ace-builds/src-min-noconflict/mode-json.js'

import {} from './assets/global.scss'
import Toaster from './directives/Materialize/toaster.directive'
import KuzzleDisconnectedPage from './components/Error/KuzzleDisconnectedPage'
import ErrorLayout from './components/Error/Layout'
import { kuzzleIsConnected } from './vuex/modules/common/kuzzle/getters'

import ModalCreate from './components/Common/Environments/ModalCreate'
import ModalDelete from './components/Common/Environments/ModalDelete'

window.jQuery = window.$ = require('jquery')
require('imports?$=jquery!materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  replace: false,
  name: 'KuzzleBackOffice',
  directives: [Toaster],
  components: {
    KuzzleDisconnectedPage,
    ErrorLayout,
    ModalCreate,
    ModalDelete
  },
  ready () {
  },
  data () {
    return {
      environmentId: null
    }
  },
  methods: {
    editEnvironment (id) {
      this.environmentId = id
      this.$broadcast('modal-open', 'create-env')
    },
    deleteEnvironment (id) {
      this.environmentId = id
      this.$broadcast('modal-open', 'delete-env')
    }
  },
  vuex: {
    getters: {
      kuzzleIsConnected
    }
  }
}
</script>
