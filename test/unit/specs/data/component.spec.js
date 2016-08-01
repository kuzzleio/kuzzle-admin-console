import Vue from 'vue'
import VueRouter from 'vue-router'
import DataRoutes from '../../../../src/routes/subRoutes/data'
import Breadcrumb from '../../../../src/components/Data/Breadcrumb'
import store from '../../../../src/vuex/store'

describe('Breadcrumb tests', () => {
  describe('Breadcrumb layout display', () => {
    let router

    beforeEach(() => {
      Vue.use(VueRouter)

      const App = Vue.extend({
        template: '<div><breadcrumb v-ref:breadcrumb></breadcrumb></div>',
        components: { Breadcrumb },
        replace: false,
        store: store
      })

      router = new VueRouter({ abstract: true })
      router.map(DataRoutes)
      router.start(App, 'body')
    })

    it('should be ok if the route name match with current route', () => {
      let currentRoute = {
        name: 'foo'
      }
      let routeActive = router.app.$refs.breadcrumb.isRouteActive(currentRoute, 'foo')
      expect(routeActive).to.be.ok
    })

    it('should be ok if one route match with current route', () => {
      let currentRoute = {
        name: 'foo'
      }
      let routeActive = router.app.$refs.breadcrumb.isRouteActive(currentRoute, ['foo', 'bar'])
      expect(routeActive).to.be.ok
    })

    it('should be not ok if the route name does not match with current route', () => {
      let currentRoute = {
        name: 'foo'
      }
      let routeActive = router.app.$refs.breadcrumb.isRouteActive(currentRoute, 'bar')
      expect(routeActive).to.be.not.ok
    })

    it('should be not ok if no route match with current route', () => {
      let currentRoute = {
        name: 'foo'
      }
      let routeActive = router.app.$refs.breadcrumb.isRouteActive(currentRoute, ['bar', 'baz'])
      expect(routeActive).to.be.not.ok
    })
  })
})
