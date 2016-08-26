import Vue from 'vue'
import VueRouter from 'vue-router'
import IndexBranch from '../../../../../../src/components/Data/Leftnav/IndexBranch'

let router

describe('IndexBranch component', () => {
  let $vm
  let tree

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
      template: `<index-branch
        v-ref:indexbranch
        :index="index"
        :collection="collection"
        :index-tree="tree">
      </index-branch>`,
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
        name: 'DataDocumentsList',
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

      $vm.routeName = 'DataCollectionWatch'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionWatch')

      $vm.routeName = 'DataDocumentsList'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataDocumentsList')
    })

    it('should correctly compute link for realtime collection', () => {
      let isRealtime = true

      $vm.routeName = 'DataCollectionWatch'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionWatch')

      $vm.routeName = 'DataDocumentsList'
      expect($vm.getRelativeLink(isRealtime)).to.equal('DataCollectionWatch')
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
      let indexName = 'indexName'
      $vm.collection = collectionName
      $vm.index = indexName
      expect($vm.isCollectionActive(indexName, collectionName)).to.equal(true)

      $vm.collection = 'tutu'
      expect($vm.isCollectionActive(collectionName)).to.equal(false)
    })
  })
})
