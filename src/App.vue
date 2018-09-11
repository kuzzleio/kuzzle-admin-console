<template>
  <div class="App">
    <div
      class="App-errored"
      v-if="$store.state.kuzzle.errorFromKuzzle">
      <error-layout>
        <kuzzle-error-page
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment">
        </kuzzle-error-page>
      </error-layout>
    </div>
    <div v-else>
      <div
        class="App-noEnvironments"
        v-if="!$store.getters.hasEnvironment">
        <create-environment-page></create-environment-page>
      </div>
      <div v-else>
        <div
          class="App-disconnected"
          v-if="!$store.getters.currentEnvironmentId">
          <!-- This is not supposed to happen, see error case above -->
        </div>
        <div
          class="App-connected"
          v-else
          >
          <div
            class="App-loggedOut"
            v-if="!$store.getters.isAuthenticated">
            <div
              class="App-noAdmin"
              v-if="!$store.getters.adminAlreadyExists">
              <sign-up
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment">
              </sign-up>
            </div>
            <div
              class="App-hasAdmin"
              v-else>
               <login
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment">
              </login>
            </div>
          </div>
          <div
            class="App-loggedIn"
            v-else>
             <router-view
              @environment::create="editEnvironment"
              @environment::delete="deleteEnvironment">
            </router-view>
          </div>
        </div>
      </div>
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
