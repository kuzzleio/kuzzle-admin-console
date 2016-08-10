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
      template: '<index-branch ' +
                  'v-ref:indexbranch ' +
                  'v-bind:index="index" ' +
                  'v-bind:collection="collection" ' +
                  'v-bind:index-tree="tree">' +
                '</index-branch>',
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
        name: 'DataIndexSummary',
        component: TestComponent
      },
      '/:index/:collection': {
        name: 'DataCollectionBrowse',
        component: TestComponent
      },
      '/:index/:collection/watch': {
        name: 'DataCollectionWatch',
        component: TestComponent
      },
      '/:index/create': {
        name: 'DataCreateCollection',
        component: {}
      }
    })

    router.start(App, 'body')
    router.go('/index/collection')

    $vm = router.app.$refs.routerview.$refs.indexbranch
  })

  describe('getRelativeLink', () => {
    it('should correctly compute link for persisted collection', () => {
      let isRealtime = false
      $vm.routeName = 'DataCollectionSummary'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionSummary')

      $vm.routeName = 'DataCollectionWatch'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionWatch')

      $vm.routeName = 'DataCollectionBrowse'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionBrowse')
    })

    it('should correctly compute link for realtime collection', () => {
      let isRealtime = true
      $vm.routeName = 'DataCollectionSummary'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionSummary')

      $vm.routeName = 'DataCollectionWatch'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionWatch')

      $vm.routeName = 'DataCollectionBrowse'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionWatch')
    })
  })

  describe('collectionCount', () => {
    it('should correctly compute collections inside an index', () => {
      expect($vm.collectionCount(tree)).to.equal(9)

      tree.collections.stored.push('toto')
      expect($vm.collectionCount(tree)).to.equal(10)

      expect($vm.collectionCount({name: 'empty-index'})).to.equal(0)
    })
  })

  describe('open', () => {
    it('should correctly toggle index branch', () => {
      expect($vm.open).to.equal(false)

      $vm.toggleBranch()
      expect($vm.open).to.equal(true)
    })

    it('should open when ready with active route', () => {
      $vm.index = 'index'
      $vm.collection = 'collection'
      $vm.$options.ready[0].call($vm)
      expect($vm.open).to.equal(false)

      $vm.index = 'kuzzle-bo-testindex'
      $vm.collection = ''
      $vm.$options.ready[0].call($vm)
      expect($vm.open).to.equal(true)

      $vm.index = 'kuzzle-bo-testindex'
      $vm.collection = 'collection'
      $vm.$options.ready[0].call($vm)
      expect($vm.open).to.equal(true)
    })
  })

  describe('isIndexActive', () => {
    it('should correctly determine whether an index is active', () => {
      let indexName = 'index'
      $vm.index = indexName
      expect($vm.isIndexActive(indexName)).to.equal(true)

      $vm.index = 'tata'
      expect($vm.isIndexActive(indexName)).to.equal(false)

      $vm.collection = 'titi'
      expect($vm.isIndexActive(indexName)).to.equal(false)
    })
  })

  describe('isCollectionActive', () => {
    it('should correctly determine whether a collection is active', () => {
      let collectionName = 'collection'
      $vm.collection = collectionName
      expect($vm.isCollectionActive(collectionName)).to.equal(true)

      $vm.collection = 'tutu'
      expect($vm.isCollectionActive(collectionName)).to.equal(false)
    })
  })
})
