import Vue from 'vue'
import VueRouter from 'vue-router'
import IndexBranch from '../../../../../../src/components/Data/Leftnav/IndexBranch'

let router
let sandbox = sinon.sandbox.create()

describe.only('IndexBranch component', () => {
  let $vm
  let collections

  before(() => {
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
      replace: false
    })

    const TestComponent = Vue.extend({
      template: `<index-branch
        v-ref:indexbranch
        current-index="myindex"
        current-collection="mycollection"
        index-name="kuzzle-bo-testindex"
        :collections="collections">
      </index-branch>`,
      components: { IndexBranch },
      data () {
        return {
          collections
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

  afterEach(() => sandbox.restore())

  describe('Methods', () => {
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

    describe('toggleBranch', () => {
      it('should correctly toggle index branch', () => {
        expect($vm.open).to.equal(false)

        $vm.toggleBranch()
        expect($vm.open).to.equal(true)
      })
    })

    describe('testOpen', () => {
      it('should open when index correspond', () => {
        $vm.open = false

        $vm.currentIndex = 'toto'
        $vm.currentCollection = 'collection'
        $vm.testOpen()
        expect($vm.open).to.equal(false)

        $vm.currentIndex = 'kuzzle-bo-testindex'
        $vm.currentCollection = ''
        $vm.testOpen()
        expect($vm.open).to.equal(true)

        $vm.currentIndex = 'kuzzle-bo-testindex'
        $vm.currentCollection = 'collection'
        $vm.testOpen()
        expect($vm.open).to.equal(true)
      })
    })

    describe('isIndexActive', () => {
      it('should correctly determine whether an index is active', () => {
        let indexName = 'index'

        $vm.currentIndex = indexName
        $vm.currentCollection = null
        expect($vm.isIndexActive(indexName)).to.equal(true)

        $vm.currentIndex = 'tata'
        expect($vm.isIndexActive(indexName)).to.equal(false)

        $vm.currentIndex = indexName
        $vm.currentCollection = 'titi'
        expect($vm.isIndexActive(indexName)).to.equal(false)
      })
    })

    describe('isCollectionActive', () => {
      it('should correctly determine whether a collection is active', () => {
        let collectionName = 'collection'
        let indexName = 'indexName'

        $vm.currentCollection = collectionName
        $vm.currentIndex = indexName
        expect($vm.isCollectionActive(indexName, collectionName)).to.equal(true)

        $vm.currentCollection = 'tutu'
        expect($vm.isCollectionActive(indexName, collectionName)).to.equal(false)
      })
    })
  })

  describe('Watch', () => {
    describe('currentIndex', () => {
      it('should call testOpen when currentIndex is set', (done) => {
        let testOpen = sandbox.stub($vm, 'testOpen')
        testOpen.reset()
        $vm.currentIndex = 'toto'

        Vue.nextTick(() => {
          expect(testOpen.callCount).to.be.equal(1)
          done()
        })
      })
    })

    describe('currentCollection', () => {
      it('should call testOpen when currentCollection is set', (done) => {
        let testOpen = sandbox.stub($vm, 'testOpen')
        testOpen.reset()
        $vm.currentCollection = 'tutu'

        Vue.nextTick(() => {
          expect(testOpen.callCount).to.be.equal(1)
          done()
        })
      })
    })
  })

  describe('Ready', () => {
    it('should call testOpen', () => {
      IndexBranch.testOpen = sandbox.stub()
      IndexBranch.ready()

      expect(IndexBranch.testOpen.callCount).to.be.equal(1)
    })
  })
})
