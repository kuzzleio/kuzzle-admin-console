import Vue from 'vue'
const AppInjector = require('!!vue?inject!../../../../src/App')
import { mockedComponent, mockedDirective } from '../helper'
import store from '../../../../src/vuex/store'
import VueRouter from 'vue-router'

describe('App.vue', () => {
  let sandbox = sinon.sandbox.create()
  Vue.use(VueRouter)

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
    describe('editEnvironment', () => {
      it('should affect the props and dispatch event', () => {
        let RootComponent = createApp()
        let router = new VueRouter({ abstract: true })
        router.start(RootComponent, 'body')
        router.go('/')
        let $vm = router.app.$refs.app
        let $broadcast = sandbox.stub($vm, '$broadcast')

        $vm.editEnvironment('toto')
        expect($vm.environmentId).to.be.equal('toto')
        expect($broadcast.calledWith('modal-open', 'create-env')).to.be.equal(true)
      })
    })

    describe('deleteEnvironment', () => {
      it('should affect the props and dispatch event', () => {
        let RootComponent = createApp()
        let router = new VueRouter({ abstract: true })
        router.start(RootComponent, 'body')
        router.go('/')
        let $vm = router.app.$refs.app
        let $broadcast = sandbox.stub($vm, '$broadcast')

        $vm.deleteEnvironment('tata')
        expect($vm.environmentId).to.be.equal('tata')
        expect($broadcast.calledWith('modal-open', 'delete-env')).to.be.equal(true)
      })
    })
  })
})
