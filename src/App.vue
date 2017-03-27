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

    <div v-if="!$store.state.kuzzle.errorFromKuzzle">
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
import {} from '../bower_components/ace-builds/src-min-noconflict/ace.js'
import {} from '../bower_components/ace-builds/src-min-noconflict/theme-tomorrow.js'
import {} from '../bower_components/ace-builds/src-min-noconflict/mode-json.js'

import {} from './assets/global.scss'
import KuzzleDisconnectedPage from './components/Error/KuzzleDisconnectedPage'
import KuzzleErrorPage from './components/Error/KuzzleErrorPage'
import ErrorLayout from './components/Error/Layout'

import ModalCreate from './components/Common/Environments/ModalCreate'
import ModalDelete from './components/Common/Environments/ModalDelete'

import Toaster from './components/Materialize/Toaster.vue'

window.jQuery = window.$ = require('jquery')
require('imports-loader?$=jquery!materialize-css/dist/js/materialize')

import 'font-awesome/css/font-awesome.css'

export default {
  name: 'KuzzleBackOffice',
  components: {
    KuzzleDisconnectedPage,
    ErrorLayout,
    ModalCreate,
    ModalDelete,
    Toaster,
    KuzzleErrorPage
  },
  data () {
    return {
      environmentId: null,
      isOpen: false,
      deleteIsOpen: false
    }
  },
  methods: {
    editEnvironment (id) {
      this.environmentId = id
      this.isOpen = true
    },
    deleteEnvironment (id) {
      this.environmentId = id
      this.deleteIsOpen = true
    },
    close () {
      this.isOpen = false
      this.deleteIsOpen = false
    }
  }
}
</script>
