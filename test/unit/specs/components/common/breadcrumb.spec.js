import Vue from 'vue'
import VueRouter from 'vue-router'
import DataRoutes from '../../../../../src/routes/subRoutes/data'
import store from '../../../../../src/vuex/store'

let BreadcrumbInjector = require('!!vue?inject!../../../../../src/components/Common/Breadcrumb')
let sandbox = sinon.sandbox.create()

// Vue.use(VueRouter)

describe('Breadcrumb tests', () => {
  let router
  let Breadcrumb
  let indexesAndCollections = sandbox.stub().returns([])
  let routeName = sandbox.stub().returns()
  let selectedIndex = sandbox.stub().returns()
  let selectedCollection = sandbox.stub().returns()
  let canSearchIndex = sandbox.stub().returns(true)

  const mockInjector = () => {
    Breadcrumb = BreadcrumbInjector({
      '../../services/userAuthorization': {
        canSearchIndex
      },
      '../../vuex/modules/data/getters': {
        indexesAndCollections,
        routeName,
        selectedIndex,
        selectedCollection
      }
    })

    const App = Vue.extend({
      template: '<div><breadcrumb v-ref:breadcrumb></breadcrumb></div>',
      components: { Breadcrumb },
      replace: false,
      store
    })

    router = new VueRouter({ abstract: true })
    router.map(DataRoutes)
    router.start(App, 'body')
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    describe('isCollectionRealtime', () => {
      it('should be ok if current index is on the realtime tree', () => {
        selectedIndex = sandbox.stub().returns('myindex')
        selectedCollection = sandbox.stub().returns('realtimeCollection')
        indexesAndCollections = sandbox.stub().returns({myindex: {realtime: ['realtimeCollection']}})
        mockInjector()

        expect(router.app.$refs.breadcrumb.isCollectionRealtime()).to.be.equal(true)
      })

      it('should be not ok if current index is on the stored tree', () => {
        selectedIndex = sandbox.stub().returns('myindex')
        selectedCollection = sandbox.stub().returns('storeCollection')
        indexesAndCollections = sandbox.stub().returns({myindex: {realtime: ['realtimeCollection']}})
        mockInjector()

        expect(router.app.$refs.breadcrumb.isCollectionRealtime()).to.be.equal(false)
      })
    })

    describe('isRouteActive', () => {
      it('should be ok if the route name match with current route', () => {
        routeName = sandbox.stub().returns('foo')
        mockInjector()

        expect(router.app.$refs.breadcrumb.isRouteActive('foo')).to.be.equal(true)
      })

      it('should be ok if one route match with current route', () => {
        routeName = sandbox.stub().returns('foo')
        mockInjector()

        expect(router.app.$refs.breadcrumb.isRouteActive(['foo', 'bar'])).to.be.equal(true)
      })

      it('should be not ok if the route name does not match with current route', () => {
        routeName = sandbox.stub().returns('foo')
        mockInjector()

        expect(router.app.$refs.breadcrumb.isRouteActive('bar')).to.be.equal(false)
      })

      it('should be not ok if no route match with current route', () => {
        routeName = sandbox.stub().returns('foo')
        mockInjector()

        expect(router.app.$refs.breadcrumb.isRouteActive(['bar', 'baz'])).to.be.equal(false)
      })
    })
  })
})
