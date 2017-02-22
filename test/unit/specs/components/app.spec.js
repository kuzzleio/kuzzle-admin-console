import Vue from 'vue'
const AppInjector = require('!!vue?inject!../../../../src/App')
import { mockedComponent, mockedDirective } from '../helper'
import store from '../../../../src/vuex/store'

describe('App.vue', () => {
  let sandbox = sinon.sandbox.create()

  const createApp = () => {
    let App = AppInjector({
      '../bower_components/ace-builds/src-min-noconflict/ace.js': {},
      '../bower_components/ace-builds/src-min-noconflict/theme-tomorrow.js': {},
      '../bower_components/ace-builds/src-min-noconflict/mode-json.js': {},
      './assets/global.scss': {},
      './directives/Materialize/toaster.directive': mockedDirective('toaster'),
      './components/Error/KuzzleDisconnectedPage': mockedComponent,
      './components/Error/Layout': mockedComponent,
      './vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: () => { return false }
      }
    })

    let RootComponent = Vue.extend({
      template: '<div><app v-ref:app></app></div>',
      components: {App},
      replace: false,
      store: store
    })

    return RootComponent
  }

  afterEach(() => sandbox.reset())

  describe('Methods', () => {
    createApp()
  })
})
