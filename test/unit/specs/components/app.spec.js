import Vue from 'vue'
const AppInjector = require('!!vue?inject!../../../../src/App')
import { mockedComponent, mockedDirective } from '../helper'
import store from '../../../../src/vuex/store'
import VueRouter from 'vue-router'

describe('App.vue', () => {
  let sandbox = sinon.sandbox.create()
  Vue.use(VueRouter)

  const defaultEnvironment = {
    host: 'localhost',
    ioPort: 7512,
    wsPort: 7513
  }
  const environments = {
    default: defaultEnvironment
  }
  const createApp = (switchEnvStub, loadEnvStub, loadLastConnectedStub) => {
    let App = AppInjector({
      '../bower_components/ace-builds/src-min-noconflict/ace.js': {},
      '../bower_components/ace-builds/src-min-noconflict/theme-tomorrow.js': {},
      '../bower_components/ace-builds/src-min-noconflict/mode-json.js': {},
      './assets/global.scss': {},
      './directives/Materialize/toaster.directive': mockedDirective('toaster'),
      './components/Error/KuzzleDisconnectedPage': mockedComponent,
      './components/Error/Layout': mockedComponent,
      './services/environment': {
        switchEnvironment: switchEnvStub,
        loadEnvironments: loadEnvStub,
        loadLastConnectedEnvId: loadLastConnectedStub
      },
      './vuex/modules/common/kuzzle/getters': {
        kuzzleIsConnected: () => { return false },
        environments: () => { return environments }
      },
      './vuex/modules/common/kuzzle/actions': {
        addEnvironment: sandbox.stub()
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

  describe('Ready', () => {
    it('should call switchEnvironment once ', (done) => {
      let switchEnvStub = sandbox.stub().returns(Promise.resolve())
      let loadEnvStub = () => { return environments }
      let loadLastConnectedStub = () => { return 'default' }

      let RootComponent = createApp(switchEnvStub, loadEnvStub, loadLastConnectedStub)
      let router = new VueRouter({ abstract: true })
      router.start(RootComponent, 'body')
      router.go('/')

      Vue.nextTick(() => {
        expect(switchEnvStub.called).to.equals(true)
        done()
      })
    })

    it('should call switchEnvironment once even when lastConnected is null', (done) => {
      let switchEnvStub = sandbox.stub().returns(Promise.resolve())
      let loadEnvStub = () => { return environments }
      let loadLastConnectedStub = () => { return null }

      let RootComponent = createApp(switchEnvStub, loadEnvStub, loadLastConnectedStub)
      let router = new VueRouter({ abstract: true })
      router.start(RootComponent, 'body')
      router.go('/')

      Vue.nextTick(() => {
        expect(switchEnvStub.called).to.equals(true)
        done()
      })
    })

    it('should call switchEnvironment once even if lastConnected does not match any env', (done) => {
      let switchEnvStub = sandbox.stub().returns(Promise.resolve())
      let loadEnvStub = () => { return environments }
      let loadLastConnectedStub = () => { return 'toto' }

      let RootComponent = createApp(switchEnvStub, loadEnvStub, loadLastConnectedStub)
      let router = new VueRouter({ abstract: true })
      router.start(RootComponent, 'body')
      router.go('/')

      Vue.nextTick(() => {
        expect(switchEnvStub.called).to.equals(true)
        done()
      })
    })

    it('should console.error when switchEnvironment rejects', (done) => {
      let switchEnvStub = sandbox.stub().returns(Promise.reject(new Error({})))
      let loadEnvStub = () => { return environments }
      let loadLastConnectedStub = () => { return 'toto' }
      let consoleErrorStub = sandbox.stub(console, 'error')

      let RootComponent = createApp(switchEnvStub, loadEnvStub, loadLastConnectedStub)
      let router = new VueRouter({ abstract: true })
      router.start(RootComponent, 'body')
      router.go('/')

      Vue.nextTick(() => {
        expect(consoleErrorStub.called).to.equals(true)
        done()
      })
    })
  })
})
