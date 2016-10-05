import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import { mockedComponent } from '../../helper'
import VueRouter from 'vue-router'

let MainMenuInjector = require('!!vue?inject!../../../../../src/components/Common/MainMenu')
let MainMenu
let sandbox = sinon.sandbox.create()
let $vm

describe('MainMenu component', () => {
  Vue.use(VueRouter)

  let router
  const DEFAULT_COLOR = 'default-color'
  let currentEnvironment = sandbox.stub().returns({name: 'env', color: 'color'})

  const mockInjector = () => {
    MainMenu = MainMenuInjector({
      '../../services/userAuthorization': {
        hasSecurityRights: sandbox.stub()
      },
      '../../vuex/modules/auth/getters': {
        user: sandbox.stub().returns({id: 'id'})
      },
      '../../vuex/modules/auth/actions': {
        doLogout: sandbox.stub()
      },
      '../../vuex/modules/common/kuzzle/getters': {
        currentEnvironment
      },
      '../../services/environment': {
        DEFAULT_COLOR
      },
      './Environments/Switch': mockedComponent,
      './Environments/ModalCreate': mockedComponent,
      './Environments/ModalDelete': mockedComponent
    })

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      replace: false
    })

    const TestComponent = Vue.extend({
      template: '<main-menu v-ref:menu></main-menu>',
      components: { MainMenu },
      replace: false,
      store
    })

    router = new VueRouter({ abstract: true })
    router.map({
      '/': {
        name: 'MainMenu',
        component: TestComponent
      },
      '/security': {
        name: 'Security',
        component: mockedComponent
      },
      '/data': {
        name: 'Data',
        component: mockedComponent
      }
    })
    router.start(App, 'body')
    router.go('/')

    $vm = router.app.$refs.routerview.$refs.menu
  }

  before(() => mockInjector())

  describe('Computed', () => {
    describe('currentEnvironmentColor', () => {
      it('should return the default color if the current environment is undefined', () => {
        currentEnvironment = sandbox.stub().returns(null)
        mockInjector()

        expect($vm.currentEnvironmentColor).to.be.equal(DEFAULT_COLOR)
      })

      it('should return the current environment color', () => {
        currentEnvironment = sandbox.stub().returns({name: 'toto', color: 'env-color'})
        mockInjector()

        expect($vm.currentEnvironmentColor).to.be.equal('env-color')
      })
    })
  })
})
