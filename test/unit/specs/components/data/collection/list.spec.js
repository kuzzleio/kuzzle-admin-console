import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent, mockedDirective } from '../../../helper'
import VueRouter from 'vue-router'

let ListInjector = require('!!vue?inject!../../../../../../src/components/Data/Collections/List')
let List
let sandbox = sinon.sandbox.create()
let $vm

Vue.use(VueRouter)

describe('List collections tests', () => {
  let listIndexesAndCollections = sandbox.stub()
  let indexesAndCollections = sandbox.stub().returns({myindex: {realtime: [], stored: []}})
  let canSearchCollection = sandbox.stub().returns(true)
  let canCreateCollection = sandbox.stub().returns(true)
  let canSearchIndex = sandbox.stub().returns(true)
  let router

  const mockInjector = () => {
    List = ListInjector({
      '../../Materialize/Headline': mockedComponent,
      './Dropdown': mockedComponent,
      '../Collections/Boxed': mockedComponent,
      '../../../vuex/modules/data/actions': {
        listIndexesAndCollections
      },
      '../../../vuex/modules/data/getters': {
        indexesAndCollections
      },
      '../../../services/userAuthorization': {
        canSearchIndex,
        canSearchCollection,
        canCreateCollection
      },
      '../../../directives/title.directive': mockedDirective
    })

    const App = Vue.extend({
      template: '<div><list v-ref:list index="myindex"></list></div>',
      components: { List },
      replace: false,
      store: store
    })

    router = new VueRouter({ abstract: true })
    router.map({
      '/create': {
        name: 'DataCreateCollection',
        component: mockedComponent
      }
    })
    router.start(App, 'body')

    $vm = router.app.$refs.list
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('computed', () => {
    describe('isCollectionForFilter', () => {
      it('should return true if a collection in realtime match the filter', () => {
        List.computed.index = 'myindex'
        List.computed.indexesAndCollections = {myindex: {realtime: ['toto', 'tutu'], stored: ['foo']}}
        List.computed.filter = 'to'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(true)
      })

      it('should return true if a collection in stored match the filter', () => {
        List.computed.index = 'myindex'
        List.computed.indexesAndCollections = {myindex: {realtime: ['toto', 'tutu'], stored: ['foo']}}
        List.computed.filter = 'fo'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(true)
      })

      it('should return true if a collection in stored and realtime match the filter', () => {
        List.computed.index = 'myindex'
        List.computed.indexesAndCollections = {myindex: {realtime: ['toto', 'tutu'], stored: ['foo', 'tuto']}}
        List.computed.filter = 'tu'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(true)
      })

      it('should return false if there is no collection matching the filter', () => {
        List.computed.index = 'myindex'
        List.computed.indexesAndCollections = {myindex: {realtime: ['toto', 'tutu'], stored: ['foo']}}
        List.computed.filter = 'bar'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(false)
      })
    })

    describe('collectionCount', () => {
      it('should return 0 if there is no current index in store', () => {
        indexesAndCollections = sandbox.stub().returns({})
        mockInjector()

        expect($vm.collectionCount).to.be.equal(0)
      })

      it('should return the right number of collections', () => {
        indexesAndCollections = sandbox.stub().returns({myindex: {stored: ['toto', 'tutu'], realtime: ['tata']}})
        mockInjector()

        expect($vm.collectionCount).to.be.equal(3)
      })
    })

    describe('storedCollections', () => {
      it('should returns empty array if there is no current index in store', () => {
        indexesAndCollections = sandbox.stub().returns({})
        mockInjector()

        expect($vm.storedCollections).to.deep.equal([])
      })

      it('should returns an array with all stored collections', () => {
        indexesAndCollections = sandbox.stub().returns({myindex: {stored: ['toto', 'tutu'], realtime: ['tata']}, other: {}})
        mockInjector()

        expect($vm.storedCollections).to.deep.equal(['toto', 'tutu'])
      })
    })

    describe('realtimeCollections', () => {
      it('should returns empty array if there is no current index in store', () => {
        indexesAndCollections = sandbox.stub().returns({})
        mockInjector()

        expect($vm.realtimeCollections).to.deep.equal([])
      })

      it('should returns an array with all realtime collections', () => {
        indexesAndCollections = sandbox.stub().returns({myindex: {stored: ['toto', 'tutu'], realtime: ['tata']}, other: {}})
        mockInjector()

        expect($vm.realtimeCollections).to.deep.equal(['tata'])
      })
    })
  })

  describe('watch', () => {
    describe('index', () => {
      it('should do nothing if the user can\'t search in index', (done) => {
        canSearchIndex = sandbox.stub().returns(false)
        mockInjector()
        listIndexesAndCollections.reset()

        $vm.index = 'toto'
        Vue.nextTick(() => {
          expect(listIndexesAndCollections.callCount).to.be.equal(0)
          done()
        })
      })

      it('should call listIndexesAndCollections if the user can search in index', (done) => {
        canSearchIndex = sandbox.stub().returns(true)
        mockInjector()
        listIndexesAndCollections.reset()

        $vm.index = 'toto'
        Vue.nextTick(() => {
          expect(listIndexesAndCollections.callCount).to.be.equal(1)
          done()
        })
      })
    })
  })

  describe('ready', () => {
    it('should do nothing if user can\'t search in index', () => {
      canSearchIndex = sandbox.stub().returns(false)
      listIndexesAndCollections = sandbox.stub()
      mockInjector()

      expect(listIndexesAndCollections.callCount).to.be.equal(0)
    })

    it('should call listIndexesAndCollections if user can search in index', () => {
      canSearchIndex = sandbox.stub().returns(true)
      listIndexesAndCollections = sandbox.stub()
      mockInjector()

      expect(listIndexesAndCollections.callCount).to.be.equal(1)
    })
  })
})
