<template>
  <div>
    <div v-if="$store.state.kuzzle.errorFromKuzzle">
      <error-layout>
        <kuzzle-error-page
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment">
        </kuzzle-error-page>
      </error-layout>
    </div>

    <div v-else-if="!$store.state.kuzzle.errorFromKuzzle && !$store.getters.hasEnvironment">
      <create-environment-page></create-environment-page>
    </div>

    <div v-else-if="$store.getters.currentEnvironmentId && !$store.getters.isAuthenticated && !$store.getters.adminAlreadyExists">
      <sign-up
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment">
      </sign-up>
    </div>

    <div v-else-if="$store.getters.currentEnvironmentId && !$store.getters.isAuthenticated">
      <login
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment">
      </login>
    </div>

    <div v-show="!$store.state.kuzzle.errorFromKuzzle && $store.getters.hasEnvironment && $store.getters.isAuthenticated">
      <router-view
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment">
      </router-view>
    </div>

    <modal-create :is-open="isOpen" :close="close" :environment-id="environmentId"></modal-create>
    <modal-delete :environment-id="environmentId" :close="close" :is-open="deleteIsOpen"></modal-delete>

    <toaster></toaster>
  </div>
</template>

<script>
import {} from '../node_modules/ace-builds/src-min-noconflict/ace.js'
import {} from '../node_modules/ace-builds/src-min-noconflict/theme-tomorrow.js'
import {} from '../node_modules/ace-builds/src-min-noconflict/mode-json.js'

import {} from './assets/global.scss'
import KuzzleDisconnectedPage from './components/Error/KuzzleDisconnectedPage'
import KuzzleErrorPage from './components/Error/KuzzleErrorPage'
import ErrorLayout from './components/Error/Layout'
import SignUp from './components/Signup'
import Login from './components/Login'
import CreateEnvironmentPage from './components/Common/Environments/CreateEnvironmentPage'

import ModalCreate from './components/Common/Environments/ModalCreate'
import ModalDelete from './components/Common/Environments/ModalDelete'

import Toaster from './components/Materialize/Toaster.vue'

// @TODO we'll have to import FA from global.scss one day...
import '@fortawesome/fontawesome-free/css/all.css'

window.jQuery = window.$ = require('jquery')
// eslint-disable-next-line
require('imports-loader?$=jquery!materialize-css/dist/js/materialize')

export default {
  name: 'KuzzleBackOffice',
  components: {
    KuzzleDisconnectedPage,
    ErrorLayout,
    ModalCreate,
    ModalDelete,
    Toaster,
    KuzzleErrorPage,
    SignUp,
    Login,
    CreateEnvironmentPage
  },
  data() {
    return {
      environmentId: null,
      isOpen: false,
      deleteIsOpen: false
    }
  },
  methods: {
    editEnvironment(id) {
      this.environmentId = id
      this.isOpen = true
    },
    deleteEnvironment(id) {
      this.environmentId = id
      this.deleteIsOpen = true
    },
    close() {
      this.isOpen = false
      this.deleteIsOpen = false
    }
  }
}
</script>
