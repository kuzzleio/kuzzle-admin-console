<template>
  <div class="App">
    <div v-if="$store.state.kuzzle.errorFromKuzzle" class="App-errored">
      <error-layout>
        <kuzzle-error-page
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment"
          @environment::importEnv="importEnv"
        />
      </error-layout>
    </div>
    <div v-else>
      <div v-if="!$store.getters.hasEnvironment" class="App-noEnvironments">
        <create-environment-page @environment::importEnv="importEnv" />
      </div>
      <div v-else>
        <div
          v-if="!$store.getters.currentEnvironmentId"
          class="App-disconnected"
        >
          <!-- This is not supposed to happen, see error case above -->
        </div>
        <div v-else class="App-connected">
          <div v-if="!$store.getters.isAuthenticated" class="App-loggedOut">
            <div v-if="!$store.getters.adminAlreadyExists" class="App-noAdmin">
              <sign-up
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </div>
            <div v-else class="App-hasAdmin">
              <login
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </div>
          </div>
          <div v-else class="App-loggedIn">
            <router-view
              @environment::create="editEnvironment"
              @environment::delete="deleteEnvironment"
              @environment::importEnv="importEnv"
            />
          </div>
        </div>
      </div>
    </div>

    <modal-create
      :is-open="isOpen"
      :close="close"
      :environment-id="environmentId"
    />
    <modal-delete
      :environment-id="environmentId"
      :close="close"
      :is-open="deleteIsOpen"
    />
    <modal-import :close="close" :is-open="importIsOpen" />

    <toaster />
  </div>
</template>

<script>
import {} from '../node_modules/ace-builds/src-min-noconflict/ace.js'
import {} from '../node_modules/ace-builds/src-min-noconflict/theme-tomorrow.js'
import {} from '../node_modules/ace-builds/src-min-noconflict/mode-json.js'
import {} from './assets/global.scss'
import KuzzleErrorPage from './components/Error/KuzzleErrorPage'
import ErrorLayout from './components/Error/Layout'
import SignUp from './components/Signup'
import Login from './components/Login'
import CreateEnvironmentPage from './components/Common/Environments/CreateEnvironmentPage'
import ModalCreate from './components/Common/Environments/ModalCreate'
import ModalDelete from './components/Common/Environments/ModalDelete'
import ModalImport from './components/Common/Environments/ModalImport'
import Toaster from './components/Materialize/Toaster.vue'
import * as types from './vuex/modules/auth/mutation-types'
import * as kuzzleTypes from './vuex/modules/common/kuzzle/mutation-types'
import { SET_TOAST } from './vuex/modules/common/toaster/mutation-types'
// @TODO we'll have to import FA from global.scss one day...
import '@fortawesome/fontawesome-free/css/all.css'
window.jQuery = window.$ = require('jquery')
// eslint-disable-next-line
require('imports-loader?$=jquery!materialize-css/dist/js/materialize')
export default {
  name: 'KuzzleBackOffice',
  components: {
    ErrorLayout,
    ModalCreate,
    ModalDelete,
    ModalImport,
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
      deleteIsOpen: false,
      importIsOpen: false
    }
  },
  mounted() {
    this.$kuzzle.removeAllListeners()
    this.$kuzzle.on('queryError', error => {
      if (error && error.message) {
        switch (error.message) {
          case 'Token expired':
          case 'Invalid token':
          case 'Json Web Token Error':
            this.$store.commit(types.SET_TOKEN_VALID, false)
            this.$kuzzle.connect()
            break
        }
      }
    })
    this.$kuzzle.on('networkError', error => {
      this.$store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, error)
    })
    this.$kuzzle.on('connected', () => {
      this.$store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, null)
      this.$store.dispatch(types.CHECK_FIRST_ADMIN)
    })
    this.$kuzzle.on('reconnected', () => {
      this.$store.commit(kuzzleTypes.SET_ERROR_FROM_KUZZLE, null)
      this.$store.dispatch(kuzzleTypes.SWITCH_LAST_ENVIRONMENT)
    })
    this.$kuzzle.on('discarded', function(data) {
      if (this.$store) {
        this.$store.commit(SET_TOAST, { text: data.message })
      }
    })
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
    importEnv() {
      this.importIsOpen = true
    },
    close() {
      this.isOpen = false
      this.deleteIsOpen = false
      this.importIsOpen = false
    }
  }
}
</script>
