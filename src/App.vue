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
        @environment::importEnv="importEnvironment"
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
    this.$log.debug('App:Mounted')
    this.initializing = true
    try {
      // NOTE This operation is pretty useless here, as the environments must be
      // loaded in the router guard. We double check here in order to display a
      // warning if necessary, since we cannot show a toast from the router guard.
      this.$store.direct.dispatch.kuzzle.loadEnvironments()
    } catch (error) {
      this.$log.error(localStorage.getItem('environments'))
      this.$bvToast.toast(
        'The list of saved connections seems to be malformed. If you know how to fix it, take a look at the console.',
        {
          title: 'Ooops! Something went wrong while loading the connections.',
          variant: 'warning',
          toaster: 'b-toaster-bottom-right',
          appendToast: true,
          dismissible: true,
          noAutoHide: true
        }
      )
    }

    try {
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
    } catch (error) {
      // TODO show error page or Toast
      // this.$store.direct.commit.kuzzle.setErrorFromKuzzle(error.message)
    }
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
