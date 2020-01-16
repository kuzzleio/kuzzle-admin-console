<template>
  <div class="App">
    <div v-if="$store.direct.state.kuzzle.errorFromKuzzle" class="App-errored">
      <error-layout>
        <kuzzle-error-page
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment"
          @environment::importEnv="importEnv"
        />
      </error-layout>
    </div>
    <div v-else>
      <div
        v-if="!$store.direct.getters.kuzzle.hasEnvironment"
        class="App-noEnvironments"
      >
        <create-environment-page @environment::importEnv="importEnv" />
      </div>
      <div v-else>
        <div
          v-if="!$store.direct.getters.kuzzle.currentEnvironmentId"
          class="App-disconnected"
        >
          <!-- This is not supposed to happen, see error case above -->
        </div>
        <div v-else class="App-connected">
          <div
            v-if="!$store.direct.getters.auth.isAuthenticated"
            class="App-loggedOut"
          >
            <div
              v-if="!$store.direct.getters.auth.adminAlreadyExists"
              class="App-noAdmin"
            >
              <sign-up
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </div>
            <div v-else class="App-hasAdmin" data-cy="App-hasAdmin">
              <login
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnv"
              />
            </div>
          </div>
          <div v-else class="App-loggedIn" data-cy="App-loggedIn">
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
require('ace-builds')
require('ace-builds/webpack-resolver')

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

// @TODO we'll have to import FA from global.scss one day...
import '@fortawesome/fontawesome-free/css/all.css'

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
    this.$store.direct.commit.auth.setTokenValid(false)
    this.$kuzzle.removeAllListeners()
    this.$kuzzle.on('queryError', error => {
      if (error && error.message) {
        switch (error.message) {
          case 'Token expired':
          case 'Invalid token':
          case 'Json Web Token Error':
            this.$store.direct.commit.auth.setTokenValid(false)
            this.$kuzzle.connect()
            break
        }
      }
    })
    this.$kuzzle.on('networkError', error => {
      this.$store.direct.commit.kuzzle.setErrorFromKuzzle(error.message)
    })
    this.$kuzzle.on('connected', () => {
      this.$store.direct.commit.kuzzle.setErrorFromKuzzle(null)
      this.$store.direct.dispatch.auth.checkFirstAdmin()
    })
    this.$kuzzle.on('reconnected', () => {
      this.$store.direct.commit.kuzzle.setErrorFromKuzzle(null)
      this.$store.direct.dispatch.kuzzle.switchLastEnvironment()
    })
    this.$kuzzle.on('discarded', function(data) {
      if (this.$store) {
        this.$store.direct.commit.toaster.setToast({ text: data.message })
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
