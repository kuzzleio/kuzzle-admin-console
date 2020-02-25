<template>
  <div class="App">
    <main-spinner v-if="initializing"></main-spinner>

    <!-- <template v-else>
      <div
        v-if="!$store.direct.getters.kuzzle.hasEnvironment"
        class="App-noEnvironments"
      >
        <create-environment-page @environment::importEnv="importEnvironment" />
      </div>
      <template v-else>
        <offline
          v-if="$store.direct.state.kuzzle.connecting"
          data-cy="App-disconnected"
        >
        </offline>
        <template v-else>
          <div
            data-cy="App-connected"
            v-if="!$store.direct.getters.auth.isAuthenticated"
          >
            <div
              v-if="!$store.direct.getters.auth.adminAlreadyExists"
              data-cy="App-noAdmin"
            >
              <sign-up
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnvironment"
              />
            </div>
            <div v-else>
              <login
                data-cy="App-hasAdmin"
                @environment::create="editEnvironment"
                @environment::delete="deleteEnvironment"
                @environment::importEnv="importEnvironment"
              />
            </div>
          </div>-->
    <template v-else>
      <router-view
        data-cy="App-loggedIn"
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment"
      />
    </template>
    <!-- </template>
      </template>
    </template> -->

    <modal-create-or-update
      id="modal-env-create-or-update"
      :environment-id="environmentId"
      @environment::importEnv="importEnvironment"
    />
    <modal-delete id="modal-env-delete" :environment-id="environmentId" />
    <modal-import id="modal-env-import" />

    <b-toast
      id="discarded-toast"
      title="Request Discarded"
      no-auto-hide
      no-close-button
      variant="danger"
      toaster="b-toaster-bottom-right"
      append="true"
    >
      Your request could not be sent to Kuzzle. Check the browser console for
      more details.
    </b-toast>
  </div>
</template>

<script>
require('ace-builds')
require('ace-builds/webpack-resolver')

import {} from './assets/global.scss'
// import SignUp from './components/Signup'
// import Offline from './components/Common/Offline'
// import Login from './components/Login'
// import CreateEnvironmentPage from './components/Common/Environments/CreateEnvironmentPage'
import ModalCreateOrUpdate from './components/Common/Environments/ModalCreateOrUpdate'
import ModalDelete from './components/Common/Environments/ModalDelete'
import ModalImport from './components/Common/Environments/ModalImport'
import MainSpinner from './components/Common/MainSpinner'

// @TODO we'll have to import FA from global.scss one day...
import '@fortawesome/fontawesome-free/css/all.css'

export default {
  name: 'KuzzleAdminConsole',
  components: {
    ModalCreateOrUpdate,
    ModalDelete,
    ModalImport,
    // SignUp,
    // Login,
    // Offline,
    // CreateEnvironmentPage,
    MainSpinner
  },
  data() {
    return {
      initializing: true,
      environmentId: null
    }
  },

  async mounted() {
    this.initializing = true

    this.$kuzzle.removeAllListeners()
    this.$kuzzle.on('queryError', error => {
      if (error && error.message) {
        switch (error.message) {
          case 'Token expired':
          case 'Invalid token':
          case 'Json Web Token Error':
            this.$store.direct.dispatch.auth.doLogout()
            break
        }
      }
    })

    this.$kuzzle.on('discarded', function() {
      this.$bvToast.show('discarded-toast')
    })
    this.initializing = false
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
