import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import { mockedComponent, mockedDirective } from '../../helper'
import Promise from 'bluebird'

let BrowseInjector = require('!!vue?inject!../../../../../src/components/Security/Roles/Browse')
let Browse
let sandbox = sinon.sandbox.create()

describe('Browse data tests', () => {
  let vm
  let formatFromQuickSearch = sandbox.stub()
  let formatFromBasicSearch = sandbox.stub()
  let formatSort = sandbox.stub()
  let searchTerm = sandbox.stub().returns()
  let rawFilter = sandbox.stub().returns()
  let basicFilter = sandbox.stub().returns()
  let sorting = sandbox.stub().returns()
  let performSearch = sandbox.stub().returns(Promise.resolve())

  const mockInjector = () => {
    Browse = BrowseInjector({
      '../../../services/filterFormat': {
        formatFromQuickSearch,
        formatFromBasicSearch,
        formatSort
      },
      '../../../vuex/modules/common/crudlDocument/getters': {
        searchTerm,
        rawFilter,
        basicFilter,
        sorting
      },
      '../../../vuex/modules/common/crudlDocument/actions': {performSearch},
      '../../Materialize/Headline': mockedComponent,
      '../../Materialize/collapsible': mockedComponent,
      '../Collections/Dropdown': mockedDirective,
      './RoleItem': mockedComponent,
      '../../Common/CrudlDocument': mockedComponent
    })

    vm = new Vue({
      template: '<div><browse v-ref:browse index="toto" collection="tutu"></browse></div>',
      components: {Browse},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.browse.$router = {go: sandbox.stub()}
  }

  beforeEach(() => mockInjector())

  afterEach(() => sandbox.restore())

  describe('computed tests', () => {
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

  describe('Methods', () => {
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

    describe('fetchData', () => {
      it('should do a formatFromQuickSearch', () => {
        searchTerm = sandbox.stub().returns({})
        basicFilter = sandbox.stub().returns(null)
        mockInjector()

        vm.$refs.browse.fetchData()
        expect(formatFromQuickSearch.called).to.be.equal(true)
      })

      it('should do a formatFromBasicSearch', () => {
        searchTerm = sandbox.stub().returns(null)
        basicFilter = sandbox.stub().returns({})
        mockInjector()

        vm.$refs.browse.fetchData()
        expect(formatFromBasicSearch.called).to.be.equal(true)
      })

      it('should perform a search with rawFilter', () => {
        searchTerm = sandbox.stub().returns(null)
        basicFilter = sandbox.stub().returns(null)
        sorting = sandbox.stub().returns(true)
        rawFilter = sandbox.stub().returns({sort: 'foo'})
        mockInjector()

        vm.$refs.browse.fetchData()
        expect(formatSort.called).to.be.equal(true)
      })

      it('should call perfomSearch and get result from this function', (done) => {
        searchTerm = sandbox.stub().returns({})
        basicFilter = sandbox.stub().returns(null)
        mockInjector()
        let performSearch = sandbox.stub(vm.$refs.browse, 'performSearch').returns(Promise.resolve([{toto: 'tata'}]))

        vm.$refs.browse.fetchData()

        setTimeout(() => {
          expect(performSearch.called).to.be.equal(true)
          expect(vm.$refs.browse.documents).to.deep.equal([{toto: 'tata'}])
          done()
        }, 0)
      })
    })
  })

  describe('Events', () => {
    it('should call toggleAll on event toggle-all', () => {
      let toggleAll = sandbox.stub(vm.$refs.browse, 'toggleAll')
      vm.$broadcast('toggle-all')

      expect(toggleAll.called).to.be.equal(true)
    })

    it('should call fetchData on event crudl-refresh-search', () => {
      let fetchData = sandbox.stub(vm.$refs.browse, 'fetchData')
      vm.$refs.browse.$emit('crudl-refresh-search')

      expect(fetchData.called).to.be.equal(true)
    })
  })

  describe('Route data', () => {
    it('should call fetchData', () => {
      Browse.route.fetchData = sandbox.stub().returns({})
      Browse.route.data()
      expect(Browse.route.fetchData.called).to.be.equal(true)
    })
  })
})
