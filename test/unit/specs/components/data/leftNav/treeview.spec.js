import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'
import dataRoutes from '../../../../../../src/routes/subRoutes/data'
import VueRouter from 'vue-router'

let TreeviewInjector = require('!!vue?inject!../../../../../../src/components/Data/Leftnav/Treeview')

let router
let sandbox = sinon.sandbox.create()

describe('Treeview component', () => {
  let $vm
  let collections
  let Treeview = TreeviewInjector({
    './IndexBranch': mockedComponent,
    '../../../services/userAuthorization': {
      canSearchIndex: sandbox.stub().returns(true)
    },
    '../../../vuex/modules/data/getters': {
      indexes: sandbox.stub().returns([]),
      indexesAndCollections: sandbox.stub().returns({})
    }
  })

  beforeEach(() => {
    Vue.use(VueRouter)

    collections = {
      'stored': [
        'emptiable-collection',
        'kuzzle-bo-test',
        'readonly-collection',
        'private-collection',
        'editable-collection',
        'not-editable-collection'
      ],
      'realtime': [
        'realtime-collection',
        'rairia-collection',
        'tatatat-collection'
      ]
    }

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      store: store,
      replace: false
    })

    const TestComponent = Vue.extend({
      template: `<treeview
        v-ref:treeview
        index="index"
        collection="collection"
        route-name="DataIndexSummary">
      </treeview>`,
      components: { Treeview }
    })

    router = new VueRouter({ abstract: true })

    Object.keys(dataRoutes).forEach(route => {
      dataRoutes[route].component = TestComponent
    })

    router.map(dataRoutes)

    router.start(App, 'body')
    router.go('/index/collection')

    $vm = router.app.$refs.routerview.$refs.treeview
  })

  describe('filterTree', () => {
    it('should not hide content if filter is empty', () => {
      $vm.filter = ''
      let showTree = $vm.filterTree('testindex', collections)
      expect(showTree).to.be.ok
    })

    it('should not hide content if filter is contained in the name of index tree', () => {
      $vm.filter = 'test'
      let showTree = $vm.filterTree('testindex', collections)
      expect(showTree).to.be.ok
    })

    it('should not hide content if filter is contained in the stored collections of index tree', () => {
      $vm.filter = 'not-editable-collection'
      let showTree = $vm.filterTree('testindex', collections)
      expect(showTree).to.be.ok
    })

    it('should not hide content if filter is contained in the realtime collections of index tree', () => {
      $vm.filter = 'realtime-collection'
      let showTree = $vm.filterTree('testindex', collections)
      expect(showTree).to.be.ok
    })

    it('should hide content if filter is not found', () => {
      $vm.filter = 'foobarbaznaz'
      let showTree = $vm.filterTree('testindex', collections)
      expect(showTree).to.be.not.ok
    })
  })
})
