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
  let getCollectionsFromIndex = sandbox.stub()
  let collections = sandbox.stub().returns({realtime: [], stored: []})
  let canSearchCollection = sandbox.stub().returns(true)
  let canCreateCollection = sandbox.stub().returns(true)
  let router

  const mockInjector = () => {
    List = ListInjector({
      '../../Materialize/Headline': mockedComponent,
      './Dropdown': mockedComponent,
      '../Collections/Boxed': mockedComponent,
      '../../../vuex/modules/data/actions': {
        getCollectionsFromIndex
      },
      '../../../vuex/modules/data/getters': {
        collections
      },
      '../../../services/userAuthorization': {
        canSearchCollection,
        canCreateCollection
      },
      '../../../directives/title.directive': mockedDirective
    })

    const App = Vue.extend({
      template: '<div><list v-ref:list></list></div>',
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
    describe('countCollection', () => {
      it('should return total collection from realtime and stored', () => {
        List.computed.collections = {realtime: ['toto', 'tutu'], stored: ['foo']}

        expect(List.computed.countCollection()).to.be.equal(3)
      })
    })

    describe('isCollectionForFilter', () => {
      it('should return true if a collection in realtime match the filter', () => {
        List.computed.collections = {realtime: ['toto', 'tutu'], stored: ['foo']}
        List.computed.filter = 'to'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(true)
      })

      it('should return true if a collection in stored match the filter', () => {
        List.computed.collections = {realtime: ['toto', 'tutu'], stored: ['foo']}
        List.computed.filter = 'fo'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(true)
      })

      it('should return true if a collection in stored and realtime match the filter', () => {
        List.computed.collections = {realtime: ['toto', 'tutu'], stored: ['foo', 'tuto']}
        List.computed.filter = 'tu'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(true)
      })

      it('should return false if there is no collection matching the filter', () => {
        List.computed.collections = {realtime: ['toto', 'tutu'], stored: ['foo']}
        List.computed.filter = 'bar'
        List.computed.$options = {filters: {filterBy: Vue.filter('filterBy')}}

        expect(List.computed.isCollectionForFilter()).to.be.equal(false)
      })
    })
  })

  describe('watch', () => {
    describe('index', () => {
      it('should do nothing if the user can\'t search in index', (done) => {
        canSearchCollection = sandbox.stub().returns(false)
        mockInjector()
        getCollectionsFromIndex.reset()

        $vm.index = 'toto'
        Vue.nextTick(() => {
          expect(getCollectionsFromIndex.callCount).to.be.equal(0)
          done()
        })
      })

      it('should call getCollectionsFromIndex if the user can search in index', (done) => {
        canSearchCollection = sandbox.stub().returns(true)
        mockInjector()
        getCollectionsFromIndex.reset()

        $vm.index = 'toto'
        Vue.nextTick(() => {
          expect(getCollectionsFromIndex.callCount).to.be.equal(1)
          done()
        })
      })
    })
  })

  describe('ready', () => {
    it('should do nothing if user can\'t search in collection', () => {
      canSearchCollection = sandbox.stub().returns(false)
      getCollectionsFromIndex = sandbox.stub()
      mockInjector()

      expect(getCollectionsFromIndex.callCount).to.be.equal(0)
    })

    it('should call getCollectionsFromIndex if user can search in collection', () => {
      canSearchCollection = sandbox.stub().returns(true)
      getCollectionsFromIndex = sandbox.stub()
      mockInjector()

      expect(getCollectionsFromIndex.callCount).to.be.equal(1)
    })
  })
})
