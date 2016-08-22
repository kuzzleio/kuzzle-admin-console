import Vue from 'vue'
import { mockedComponent } from '../../../helper'
import dataRoutes from '../../../../../../src/routes/subRoutes/data'
import VueRouter from 'vue-router'

let TreeviewInjector = require('!!vue?inject!../../../../../../src/components/Data/Leftnav/Treeview')

let router

describe('Treeview component', () => {
  let $vm
  let tree
  let Treeview = TreeviewInjector({
    './IndexBranch': mockedComponent
  })

  beforeEach(() => {
    Vue.use(VueRouter)

    tree = {
      'name': 'kuzzle-bo-testindex',
      'collections': {
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
    }

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      replace: false
    })

    const TestComponent = Vue.extend({
      template: `<treeview
        v-ref:treeview
        v-bind:index="index"
        v-bind:collection="collection"
        v-bind:index-tree="tree">
      </treeview>`,
      components: { Treeview },
      data () {
        return {
          index: 'index',
          collection: 'collection',
          routeName: 'DataIndexSummary',
          tree: tree
        }
      }
    })

    router = new VueRouter({ abstract: true })

    Object.keys(dataRoutes).forEach(route => {
      dataRoutes[route].component = TestComponent
    })

    router.map(dataRoutes)

    router.start(App, 'body')
    router.go('/data/index/collection')

    $vm = router.app.$refs.routerview.$refs.treeview
  })

  describe('filterTree', () => {
    it('should not hide content if filter is empty', () => {
      let showTree = $vm.filterTree('', tree)
      expect(showTree).to.be.ok
    })

    it('should not hide content if filter is contained in the name of index tree', () => {
      let showTree = $vm.filterTree('testindex', tree)
      expect(showTree).to.be.ok
    })

    it('should not hide content if filter is contained in the stored collections of index tree', () => {
      let showTree = $vm.filterTree('not-editable-collection', tree)
      expect(showTree).to.be.ok
    })

    it('should not hide content if filter is contained in the realtime collections of index tree', () => {
      let showTree = $vm.filterTree('realtime-collection', tree)
      expect(showTree).to.be.ok
    })

    it('should hide content if filter is not found', () => {
      let showTree = $vm.filterTree('foobarbaznaz', tree)
      expect(showTree).to.be.not.ok
    })
  })
})
