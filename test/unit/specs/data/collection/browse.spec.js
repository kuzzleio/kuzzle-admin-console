import Vue from 'vue'
import store from '../../../../../src/vuex/store'

let BrowseInjector = require('!!vue?inject!../../../../../src/components/Data/Collections/Browse')
let Browse

describe('Browse data tests', () => {
  describe('computed tests', () => {
    let vm

    beforeEach(() => {
      Browse = BrowseInjector({})

      vm = new Vue({
        template: '<div><browse v-ref:browse></browse></div>',
        components: {Browse},
        replace: false,
        store: store
      }).$mount()
    })

    it('displayBulkDelete should return true if there is selected elements', () => {
      vm.$refs.browse.selectedDocuments = ['foo']
      expect(vm.$refs.browse.displayBulkDelete).to.equals(true)
    })

    it('allChecked should return true if all documents are selected', () => {
      vm.$refs.browse.documents = [{id: 'foo'}, {id: 'bar'}]
      vm.$refs.browse.selectedDocuments = ['foo', 'bar']
      expect(vm.$refs.browse.allChecked).to.equals(true)
    })
  })

  describe('methods tests', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><browse v-ref:browse></browse></div>',
        components: {Browse},
        replace: false,
        store: store
      }).$mount()
    })

    it('isChecked should return true if my document is selected in the list', () => {
      vm.$refs.browse.selectedDocuments = ['foo']
      expect(vm.$refs.browse.isChecked('foo')).to.equals(true)
    })

    it('toggleAll should select all document', () => {
      vm.$refs.browse.documents = [{id: 'foo'}, {id: 'bar'}]
      vm.$refs.browse.toggleAll()
      expect(vm.$refs.browse.selectedDocuments).to.deep.equals(['foo', 'bar'])
    })

    it('toggleAll should unselect all document', () => {
      vm.$refs.browse.documents = [{id: 'foo'}, {id: 'bar'}]
      vm.$refs.browse.selectedDocuments = vm.$refs.browse.documents
      vm.$refs.browse.toggleAll()
      expect(vm.$refs.browse.selectedDocuments).to.deep.equals([])
    })

    it('toggleSelectDocuments should select a document in the list', () => {
      vm.$refs.browse.documents = [{id: 'foo'}, {id: 'bar'}]
      vm.$refs.browse.toggleSelectDocuments('foo')
      expect(vm.$refs.browse.selectedDocuments).to.deep.equals(['foo'])
    })

    it('toggleSelectDocuments should unselect a document in the list', () => {
      vm.$refs.browse.documents = [{id: 'foo'}, {id: 'bar'}]
      vm.$refs.browse.selectedDocuments = ['foo']
      vm.$refs.browse.toggleSelectDocuments('foo')
      expect(vm.$refs.browse.selectedDocuments).to.deep.equals([])
    })
  })

  describe('route data tests', () => {
    describe('perform search tests', () => {
      let formatFromQuickSearch = sinon.spy()
      let formatFromBasicSearch = sinon.spy()
      let formatSort = sinon.spy()

      let initInjector = () => {
        Browse = BrowseInjector({
          '../../../vuex/modules/common/crudlDocument/getters': sinon.stub(),
          '../../../services/filterFormat': {
            formatFromQuickSearch,
            formatFromBasicSearch,
            formatSort
          },
          '../../../services/kuzzleWrapper': {
            performSearch: sinon.stub().returns(Promise.resolve())
          }
        })

        Browse.route.$route = {params: {}}
      }

      it('should do a formatFromQuickSearch', () => {
        initInjector()
        Browse.route.searchTerm = sinon.stub().returns({})
        Browse.route.data()
        expect(formatFromQuickSearch.called).to.be.ok
      })

      it('should do a formatFromBasicSearch', () => {
        initInjector()
        Browse.route.searchTerm = undefined
        Browse.route.basicFilter = sinon.stub().returns({})
        Browse.route.data()
        expect(formatFromBasicSearch.called).to.be.ok
      })

      it('should perform a search with rawFilter', () => {
        initInjector()
        Browse.route.searchTerm = undefined
        Browse.route.basicFilter = undefined
        Browse.route.sorting = sinon.stub().returns(true)
        Browse.route.rawFilter = {sort: 'foo'}
        Browse.route.data()
        expect(formatSort.called).to.be.ok
      })
    })
  })
})
