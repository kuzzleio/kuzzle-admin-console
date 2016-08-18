import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import { mockedComponent } from '../../helper'

let BrowseInjector = require('!!vue?inject!../../../../../src/components/Security/Users/Browse')
let Browse
let sandbox = sinon.sandbox.create()

describe('Browse users', () => {
  let vm

  before(() => {
    Browse = BrowseInjector({
      '../../Materialize/Headline': mockedComponent,
      '../../Common/Browse': mockedComponent
    })

    vm = new Vue({
      template: '<div><browse v-ref:browse ></browse></div>',
      components: {Browse},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.browse.$router = {go: sandbox.stub()}
  })

  describe('Methods', () => {
    it('should redirect on right url on createUser call', () => {
      vm.$refs.browse.createUser()
      expect(vm.$refs.browse.$router.go.calledWithMatch({name: 'SecurityCreateUser'})).to.be.equal(true)
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
