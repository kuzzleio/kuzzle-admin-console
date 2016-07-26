import Vue from 'vue'
import IndexBranch from '../../../../../src/components/Data/Browse/IndexBranch'
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

describe('IndexBranch component', () => {
  beforeEach(() => {
    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><index-branch v-ref:indexbranch v-bind:index="tree"></index-branch></div>',
      components: { IndexBranch },
      data () {
        return {
          tree: tree
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
    expect(router.app.$refs.indexbranch.collectionCount(tree)).to.equal(9)

    tree.collections.stored.push('toto')
    expect(router.app.$refs.indexbranch.collectionCount(tree)).to.equal(10)

    expect(router.app.$refs.indexbranch.collectionCount({name: 'empty-index'})).to.equal(0)
  })

  it('should correctly toggle index branch', () => {
    expect(router.app.$refs.indexbranch.open).to.equal(false)

    router.app.$refs.indexbranch.toggleBranch()
    expect(router.app.$refs.indexbranch.open).to.equal(true)
  })

  it('should correctly determine whether an index is active', () => {
    let indexName = 'toto'
    let $route = {
      params: {
        index: indexName
      }
    }

    expect(router.app.$refs.indexbranch.isIndexActive($route, indexName)).to.equal(true)

    $route.params.index = 'tata'
    expect(router.app.$refs.indexbranch.isIndexActive($route, indexName)).to.equal(false)

    $route.params.index = indexName
    $route.params.collection = 'titi'
    expect(router.app.$refs.indexbranch.isIndexActive($route, indexName)).to.equal(false)
  })

  it('should correctly determine whether a collection is active', () => {
    let collectionName = 'tata'
    let $route = {
      params: {
        index: 'toto',
        collection: collectionName
      }
    }
    expect(router.app.$refs.indexbranch.isCollectionActive($route, collectionName)).to.equal(true)

    $route.params.collection = 'tutu'
    expect(router.app.$refs.indexbranch.isCollectionActive($route, collectionName)).to.equal(false)
  })

  it('should open when ready with active route', () => {
    // Saving the original route to avoid collisions with other router-enabled
    // components
    let originalRoute = {}
    Object.assign(originalRoute, router.app.$refs.indexbranch.$route)

    router.app.$refs.indexbranch.open = false
    router.app.$refs.indexbranch.$route = {
      params: {
        index: 'toto'
      },
      path: '/toto'
    }

    router.app.$refs.indexbranch.$options.ready[0].call(router.app.$refs.indexbranch)
    expect(router.app.$refs.indexbranch.open).to.equal(false)

    router.app.$refs.indexbranch.$route.params.index = 'kuzzle-bo-testindex'
    router.app.$refs.indexbranch.$options.ready[0].call(router.app.$refs.indexbranch)
    expect(router.app.$refs.indexbranch.open).to.equal(true)

    // Restoring the original route
    router.app.$refs.indexbranch.$route = originalRoute
  })
})
