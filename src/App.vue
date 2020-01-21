<template>
  <div class="App">
    <div v-if="$store.direct.state.kuzzle.errorFromKuzzle" class="App-errored">
      <error-layout>
        <kuzzle-error-page
          @environment::create="editEnvironment"
          @environment::delete="deleteEnvironment"
        />
      </error-layout>
    </div>
    <template v-else>
      <div
        v-if="!$store.direct.getters.kuzzle.hasEnvironment"
        class="App-noEnvironments"
      >
        <create-environment-page @environment::importEnv="importEnvironment" />
      </div>
      <template v-else>
        <div
          v-if="!$store.direct.getters.kuzzle.currentEnvironmentId"
          class="App-disconnected"
        ></div>
        <template v-else data-cy="App-connected" class="h-100">
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
                @environment::importEnv="importEnvironment"
              />
            </div>
            <div v-else class="App-hasAdmin" data-cy="App-hasAdmin">
              <login
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnvironment"
              />
            </div>
          </div>
          <template v-else class="App-loggedIn h-100" data-cy="App-loggedIn">
            <router-view
              @environment::create="editEnvironment"
              @environment::delete="deleteEnvironment"
            />
          </template>
        </template>
      </template>
    </template>

    <modal-create-or-update
      id="modal-env-create-or-update"
      :environment-id="environmentId"
      @environment::importEnv="importEnvironment"
    />
    <modal-delete id="modal-env-delete" :environment-id="environmentId" />
    <modal-import id="modal-env-import" />

    <!-- <toaster /> -->
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
import ModalCreateOrUpdate from './components/Common/Environments/ModalCreateOrUpdate'
import ModalDelete from './components/Common/Environments/ModalDelete'
import ModalImport from './components/Common/Environments/ModalImport'
// import Toaster from './components/Materialize/Toaster.vue'

// @TODO we'll have to import FA from global.scss one day...
import '@fortawesome/fontawesome-free/css/all.css'

export default {
  name: 'KuzzleAdminConsole',
  components: {
    ErrorLayout,
    ModalCreateOrUpdate,
    ModalDelete,
    ModalImport,
    // Toaster,
    KuzzleErrorPage,
    SignUp,
    Login,
    CreateEnvironmentPage
  },
  data() {
    return {
      environmentId: null
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
      this.$bvModal.show('modal-env-create-or-update')
    },
    deleteEnvironment(id) {
      this.environmentId = id
      this.$bvModal.show('modal-env-delete')
    },
    importEnvironment() {
      this.$bvModal.show('modal-env-import')
    }
  }
}
</script>

<style lang="scss" scoped>
.App {
  height: 100%;
}
</style>
