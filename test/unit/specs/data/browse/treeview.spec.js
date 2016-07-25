import Vue from 'vue'
import Treeview from '../../../../../src/components/Data/Browse/Treeview'
import VueRouter from 'vue-router'
import DataRoutes from '../../../../../src/routes/subRoutes/data'

let router
let tree = {
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

describe('Treeview component', () => {
  beforeEach(() => {
    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><treeview v-ref:treeview :tree="tree"></treeview></div>',
      components: { Treeview },
      data () {
        return {
          tree: [tree]
        }
      },
      replace: false
    })

    router = new VueRouter({ abstract: true })
    router.map(DataRoutes)

    router.start(App, 'body')
    router.go('/index/collection')
  })

  it('should correctly compute collections inside an index', () => {
    expect(router.app.$refs.treeview.collectionCount(tree)).to.equal(9)

    tree.collections.stored.push('toto')
    expect(router.app.$refs.treeview.collectionCount(tree)).to.equal(10)

    expect(router.app.$refs.treeview.collectionCount({name: 'empty-index'})).to.equal(0)
  })

  it('should correctly toggle index branch', () => {
    expect(router.app.$refs.treeview.openBranches[0]).to.equal(undefined)

    router.app.$refs.treeview.toggleBranch(0)
    expect(router.app.$refs.treeview.openBranches[0]).to.equal(true)
  })
})
