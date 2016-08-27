import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let ListInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/List')
let List
let sandbox = sinon.sandbox.create()

describe('List documents', () => {
  let vm
  let indexesAndCollections = sandbox.stub().returns({myindex: {realtime: [], stored: []}})

  const mockInjector = () => {
    List = ListInjector({
      '../Collections/Tabs': mockedComponent,
      '../../Common/List': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      '../Collections/Dropdown': mockedComponent,
      '../../../vuex/modules/data/getters': {
        indexesAndCollections
      }
    })

    vm = new Vue({
      template: '<div><list v-ref:list index="myindex"></list></div>',
      components: {List},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.list.$router = {go: sandbox.stub()}
  }

  before(() => {
    mockInjector()
  })

  describe('Methods', () => {
    it('should redirect on right url on createDocument call', () => {
      vm.$refs.list.createDocument()
      expect(vm.$refs.list.$router.go.calledWithMatch({name: 'DataCreateDocument'})).to.be.equal(true)
    })
  })

  describe('Route', () => {
    it('should broadcast event when the route change', (done) => {
      List.route.$broadcast = sandbox.stub()
      List.route.data()

      setTimeout(() => {
        expect(List.route.$broadcast.calledWith('crudl-refresh-search')).to.be.equal(true)
        done()
      }, 0)
    })
  })

  describe('Computed', () => {
    describe('isRealtimeCollection', () => {
      it('returns false if the collections object is undefined or has no realtime attribute', () => {
        indexesAndCollections = sandbox.stub().returns({})
        mockInjector()
        vm.$refs.list.collection = 'toto'
        expect(List.computed.isRealtimeCollection()).to.be.equal(false)

        indexesAndCollections = sandbox.stub().returns({myindex: {realtime: [], stored: []}})
        mockInjector()
        vm.$refs.list.collection = 'toto'
        expect(List.computed.isRealtimeCollection()).to.be.equal(false)
      })

      it('returns true if the collections.realtime object contains the name of the current collection', () => {
        indexesAndCollections = sandbox.stub().returns({myindex: {realtime: ['toto'], stored: []}})
        mockInjector()
        vm.$refs.list.collection = 'toto'

        expect(vm.$refs.list.isRealtimeCollection).to.be.equal(true)
      })
    })
  })
})
