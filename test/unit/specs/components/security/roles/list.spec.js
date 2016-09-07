import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'
import VueRouter from 'vue-router'

let BrowseInjector = require('!!vue?inject!../../../../../../src/components/Security/Roles/List')
let Browse
let router
let sandbox = sinon.sandbox.create()

describe.only('Browse roles', () => {
  let vm

  before(() => {
    Vue.use(VueRouter)

    Browse = BrowseInjector({
      '../../Materialize/Headline': mockedComponent,
      '../../Common/Browse': mockedComponent
    })

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      store: store,
      replace: false
    })

    const TestComponent = Vue.extend({
      template: '<div><browse v-ref:browse ></browse></div>',
      components: {Browse},
      replace: false,
      store: store
    })

    router = new VueRouter({ abstract: true })

    Object.keys(dataRoutes).forEach(route => {
      dataRoutes[route].component = TestComponent
    })

    router.map(dataRoutes)

    router.start(App, 'body')
    router.go('/index/collection')

    vm = router.app.$refs.routerview
  })

  describe('Methods', () => {
    it('should redirect on right url on createRole call', () => {
      vm.$refs.browse.createRole()
      expect(vm.$refs.browse.$router.go.calledWithMatch({name: 'SecurityRolesCreate'})).to.be.equal(true)
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
