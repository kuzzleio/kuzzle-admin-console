import Vue from 'vue'
import App from '../../../../src/App'
import store from '../../../../src/vuex/store'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

describe('App.vue', () => {
  let sandbox = sinon.sandbox.create()

  const createVm = () => {
    let vm = new Vue({
      template: '<app></app>',
      components: {App},
      replace: false,
      store: store
    })
    vm.switchEnvironment = sandbox.stub().returns(Promise.resolve())
    vm.loadEnvironments = () => { return {} }
    vm.addEnvironment = sandbox.stub()

    return vm
  }

  afterEach(() => sandbox.reset())

  describe('Ready', () => {
    it('should call switchEnvironment once', () => {
      let vm = createVm()
      vm.$mount()
      expect(vm.switchEnvironment.calledWith('valid'))
    })
  })
})
