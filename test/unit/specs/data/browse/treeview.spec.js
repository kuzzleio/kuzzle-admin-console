import Vue from 'vue'
import IndexBranch from '../../../../../src/components/Data/Browse/IndexBranch'
import VueRouter from 'vue-router'

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
let $vm

describe('IndexBranch component', () => {
  beforeEach(() => {
    Vue.use(VueRouter)

    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      replace: false
    })

    const TestComponent = Vue.extend({
      template: '<index-branch v-ref:indexbranch v-bind:index="tree"></index-branch>',
      components: { IndexBranch },
      data () {
        return {
          tree: tree
        }
      }
    })

    router = new VueRouter({ abstract: true })
    router.map({
      '/:index': {
        name: 'DataIndex',
        component: TestComponent
      },
      '/:index/:collection': {
        name: 'DataIndexCollection',
        component: TestComponent
      },
      '/:index/create': {
        name: 'Index',
        component: {}
      }
    })

    router.start(App, 'body')
    router.go('/index/collection')

    $vm = router.app.$refs.routerview.$refs.indexbranch
  })

  it('should correctly compute collections inside an index', () => {
    expect($vm.collectionCount(tree)).to.equal(9)

    tree.collections.stored.push('toto')
    expect($vm.collectionCount(tree)).to.equal(10)

    expect($vm.collectionCount({name: 'empty-index'})).to.equal(0)
  })

  it('should correctly toggle index branch', () => {
    expect($vm.open).to.equal(false)

    $vm.toggleBranch()
    expect($vm.open).to.equal(true)
  })

  it('should correctly determine whether an index is active', () => {
    let indexName = 'toto'
    let $route = {
      params: {
        index: indexName
      }
    }

    expect($vm.isIndexActive($route, indexName)).to.equal(true)

    $route.params.index = 'tata'
    expect($vm.isIndexActive($route, indexName)).to.equal(false)

    $route.params.index = indexName
    $route.params.collection = 'titi'
    expect($vm.isIndexActive($route, indexName)).to.equal(false)
  })

  it('should correctly determine whether a collection is active', () => {
    let collectionName = 'tata'
    let $route = {
      params: {
        index: 'toto',
        collection: collectionName
      }
    }
    expect($vm.isCollectionActive($route, collectionName)).to.equal(true)

    $route.params.collection = 'tutu'
    expect($vm.isCollectionActive($route, collectionName)).to.equal(false)
  })

  it('should open when ready with active route', () => {
    router.go('/index/collection')
    $vm.$options.ready[0].call($vm)
    expect($vm.open).to.equal(false)

    router.go('/kuzzle-bo-testindex')
    $vm.$options.ready[0].call($vm)
    expect($vm.open).to.equal(true)

    router.go('/kuzzle-bo-testindex/collection')
    $vm.$options.ready[0].call($vm)
    expect($vm.open).to.equal(true)
  })
})
