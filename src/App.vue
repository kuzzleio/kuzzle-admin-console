<template>
  <div class="App">
    <main-spinner v-if="initializing"></main-spinner>
    <template v-else>
      <router-view
        data-cy="App-loggedIn"
        @environment::create="editEnvironment"
        @environment::delete="deleteEnvironment"
        @environment::importEnv="importEnvironment"
      />
    </template>

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
      this.$log.error(error.message)
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
