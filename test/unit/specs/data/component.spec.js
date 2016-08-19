import Vue from 'vue'
import VueRouter from 'vue-router'
import DataRoutes from '../../../../src/routes/subRoutes/data'
import Breadcrumb from '../../../../src/components/Common/Breadcrumb'

describe('Breadcrumb tests', () => {
  describe('Breadcrumb layout display', () => {
    let router

    beforeEach(() => {
      Vue.use(VueRouter)

      const App = Vue.extend({
        template: '<div><breadcrumb ' +
          ':route-name="routeName" ' +
          ':index="index" ' +
          ':collection="collection" ' +
          ':tree="tree" ' +
          'v-ref:breadcrumb>' +
          '</breadcrumb></div>',
        components: { Breadcrumb },
        data () {
          return {
            tree: [{
              name: 'myindex',
              collections: {
                realtime: ['realtimeCollection'],
                stored: ['storedCollection']
              }
            }],
            index: 'myindex',
            collection: 'realtimeCollection',
            routeName: 'foo'
          }
        },
        replace: false
      })

      router = new VueRouter({ abstract: true })
      router.map(DataRoutes)
      router.start(App, 'body')
    })

    describe('isCollectionRealtime', () => {
      it('should be ok if current index is on the realtime tree', () => {
        router.app.$refs.breadcrumb.index = 'myindex'
        router.app.$refs.breadcrumb.collection = 'realtimeCollection'

        let isCollectionRealtime = router.app.$refs.breadcrumb.isCollectionRealtime()

        expect(isCollectionRealtime).to.be.ok
      })

      it('should be not ok if current index is on the stored tree', () => {
        router.app.$refs.breadcrumb.index = 'myindex'
        router.app.$refs.breadcrumb.collection = 'storedCollection'

        let isCollectionRealtime = router.app.$refs.breadcrumb.isCollectionRealtime()

        expect(isCollectionRealtime).to.be.not.ok
      })
    })

    describe('isRouteActive', () => {
      it('should be ok if the route name match with current route', () => {
        let routeActive = router.app.$refs.breadcrumb.isRouteActive('foo')
        expect(routeActive).to.be.ok
      })

      it('should be ok if one route match with current route', () => {
        let routeActive = router.app.$refs.breadcrumb.isRouteActive(['foo', 'bar'])
        expect(routeActive).to.be.ok
      })

      it('should be not ok if the route name does not match with current route', () => {
        let routeActive = router.app.$refs.breadcrumb.isRouteActive('bar')
        expect(routeActive).to.be.not.ok
      })

      it('should be not ok if no route match with current route', () => {
        let routeActive = router.app.$refs.breadcrumb.isRouteActive(['bar', 'baz'])
        expect(routeActive).to.be.not.ok
      })
    })
  })
})
