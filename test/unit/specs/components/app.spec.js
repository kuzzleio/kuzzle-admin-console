import Vue from 'vue'
import App from '../../../../src/App'
import store from '../../../../src/vuex/store'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

describe('App.vue', () => {
  let vm
  let sandbox = sinon.sandbox.create()

  beforeEach(() => {
    vm = new Vue({
      template: '<app></app>',
      components: {App},
      replace: false,
      store: store
    })
    vm.switchEnvironment = sinon.stub()
    vm.$mount()
  })

  afterEach(() => sandbox.reset())

  describe('Ready', () => {
    it('should call switchEnvironment once', () => {
      expect(vm.switchEnvironment.calledWith('valid'))
    })
  })
})
