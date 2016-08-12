import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../../../../src/vuex/store'
import { mockedComponent } from '../helper'
const homeInjector = require('!!vue?inject!../../../../src/components/Home')

describe('Home.vue tests', () => {
  let Home
  let vm
  let $broadcast
  let sandbox = sinon.sandbox.create()

  let injectMock = () => {
    Home = homeInjector({
      './Common/MainMenu': mockedComponent,
      './Common/Login/Form': mockedComponent,
      './Materialize/Modal': mockedComponent,
      '../vuex/modules/auth/getters': {
        tokenValid: sandbox.stub().returns(false)
      }
    })

    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><home v-ref:home></home></div>',
      components: { Home },
      store,
      replace: false
    })

    let router = new VueRouter({ abstract: true })
    router.map({
      '/foo': {
        name: 'foo',
        component: mockedComponent
      }
    })

    router.start(App, 'body')
    router.go('/foo')

    vm = router.app
  }

  afterEach(() => {
    sandbox.reset()
  })

  beforeEach(() => {
    injectMock()
    $broadcast = sandbox.stub(vm.$refs.home, '$broadcast')
  })

  describe('watch tests', () => {
    describe('tokenValid', () => {
      it('should open the login modal if value pass to false', () => {
        Home.watch.$broadcast = sandbox.stub()
        Home.watch.tokenValid(false)

        expect(Home.watch.$broadcast.calledWith('modal-open', 'tokenExpired')).to.be.ok
      })

      it('should do nothing if value pass to true', () => {
        Home.watch.$broadcast = sandbox.stub()
        Home.watch.tokenValid(true)

        expect(Home.watch.$broadcast.called).to.be.not.ok
      })
    })
  })

  describe('methods tests', () => {
    describe('onLogin', () => {
      it('should close the login modal if value pass to false', () => {
        vm.$refs.home.onLogin()

        expect($broadcast.calledWith('modal-close', 'tokenExpired')).to.be.ok
      })
    })
  })
})
