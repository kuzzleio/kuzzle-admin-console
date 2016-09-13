import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'
import securityRoutes from '../../../../../../src/routes/subRoutes/security'
import VueRouter from 'vue-router'

let BrowseInjector = require('!!vue?inject!../../../../../../src/components/Security/Roles/List')
let Browse
let router
let sandbox = sinon.sandbox.create()

describe('Browse roles', () => {
  let vm

  beforeEach(() => {
    Vue.use(VueRouter)

    Browse = BrowseInjector({
      '../../Materialize/Headline': mockedComponent,
      '../../Common/List': mockedComponent
    })

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      store: store,
      replace: false
    })

    const TestComponent = Vue.extend({
      template: '<div><browse v-ref:browse ></browse></div>',
      components: {Browse},
      store: store
    })

    router = new VueRouter({ abstract: true })

    Object.keys(securityRoutes).forEach(route => {
      securityRoutes[route].component = TestComponent
    })

    router.map(securityRoutes)

    router.start(App, 'body')
    router.go({name: 'SecurityUsersList'})

    vm = router.app.$refs.routerview.$refs.browse
    vm.$router = {go: sandbox.stub()}
  })

  describe('Methods', () => {
    it('should redirect on right url on createRole call', () => {
      vm.createRole()
      expect(vm.$router.go.calledWithMatch({name: 'SecurityRolesCreate'})).to.be.equal(true)
    })
  })

  describe('Route', () => {
    it('should broadcast event when the route change', () => {
      Browse.route.$broadcast = sandbox.stub()
      Browse.route.data()

      expect(Browse.route.$broadcast.calledWith('crudl-refresh-search')).to.be.equal(true)
    })
  })
})
