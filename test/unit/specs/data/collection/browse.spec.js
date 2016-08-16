import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import { mockedComponent } from '../../helper'

let BrowseInjector = require('!!vue?inject!../../../../../src/components/Data/Collections/Browse')
let Browse
let sandbox = sinon.sandbox.create()

describe('Browse documents', () => {
  let vm

  before(() => {
    Browse = BrowseInjector({
      '../../Materialize/Headline': mockedComponent,
      '../../Common/Browse': mockedComponent,
      '../Collections/Dropdown': mockedComponent
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
    it('should redirect on right url on createDocument call', () => {
      vm.$refs.browse.createDocument()
      expect(vm.$refs.browse.$router.go.calledWithMatch({name: 'DataCreateDocument'})).to.be.equal(true)
    })
  })

  describe('Route', () => {
    it('should broadcast event when the route change', (done) => {
      Browse.route.$broadcast = sandbox.stub()
      Browse.route.data()

      setTimeout(() => {
        expect(Browse.route.$broadcast.calledWith('crudl-refresh-search')).to.be.equal(true)
        done()
      }, 0)
    })
  })
})
