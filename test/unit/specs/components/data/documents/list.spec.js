import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let BrowseInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/List')
let Browse
let sandbox = sinon.sandbox.create()

describe('Browse documents', () => {
  let vm
  let getCollectionsFromTree = () => { return {realtime: [], stored: []} }
  let indexesAndCollections = sandbox.stub().returns([{realtime: [], stored: []}])

  const mockInjector = () => {
    Browse = BrowseInjector({
      '../Collections/Tabs': mockedComponent,
      '../../Common/List': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      '../Collections/Dropdown': mockedComponent,
      '../../../services/data': {
        getCollectionsFromTree
      },
      '../../../vuex/modules/data/getters': {
        indexesAndCollections
      }
    })

    vm = new Vue({
      template: '<div><browse v-ref:browse></browse></div>',
      components: {Browse},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.browse.$router = {go: sandbox.stub()}
  }

  before(() => {
    mockInjector()
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

  describe('Computed', () => {
    describe('isRealtimeCollection', () => {
      it('returns false if the collections object is undefined or has no realtime attribute', () => {
        getCollectionsFromTree = sandbox.stub().returns(undefined)
        mockInjector()
        vm.$refs.browse.collection = 'toto'
        expect(Browse.computed.isRealtimeCollection()).to.be.equal(false)

        getCollectionsFromTree = sandbox.stub().returns({})
        mockInjector()
        vm.$refs.browse.collection = 'toto'
        expect(Browse.computed.isRealtimeCollection()).to.be.equal(false)
      })

      it('returns true if the collections.realtime object contains the name of the current collection', () => {
        getCollectionsFromTree = sandbox.stub().returns({realtime: ['toto'], stored: []})
        mockInjector()
        vm.$refs.browse.collection = 'toto'

        expect(vm.$refs.browse.isRealtimeCollection).to.be.equal(true)
      })
    })
  })

  describe('Ready', () => {
    describe('description', () => {

    })
  })
})
