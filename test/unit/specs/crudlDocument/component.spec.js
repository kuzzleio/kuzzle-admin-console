import Vue from 'vue'
import { mockedComponent } from '../helper'
import store from '../../../../src/vuex/store'

let CrudlDocumentInjector = require('!!vue?inject!../../../../src/components/Common/CrudlDocument')
import Promise from 'bluebird'

let CrudlDocument
let vm
let sandbox = sinon.sandbox.create()
let documents = sandbox.stub().returns([])
let totalDocuments = sandbox.stub()
let paginationFrom = sandbox.stub()
let paginationSize = sandbox.stub()
let searchTerm = sandbox.stub()
let rawFilter = sandbox.stub()
let basicFilter = sandbox.stub()
let sorting = sandbox.stub()
let basicFilterForm = sandbox.stub()
let go = sandbox.stub()
let $broadcast
let formatFromQuickSearch = sandbox.spy()
let formatFromBasicSearch = sandbox.spy()
let formatSort = sandbox.spy()

let initInjector = () => {
  CrudlDocument = CrudlDocumentInjector({
    '../../vuex/modules/common/crudlDocument/getters': {
      documents,
      totalDocuments,
      paginationFrom,
      paginationSize,
      searchTerm,
      rawFilter,
      basicFilter,
      sorting,
      basicFilterForm
    },
    '../../services/filterFormat': {
      formatFromQuickSearch,
      formatFromBasicSearch,
      formatSort
    },
    '../../Common/Filters/Filters': mockedComponent,
    '../../Materialize/Modal': mockedComponent,
    '../../Materialize/Dropdown': mockedComponent,
    '../../Materialize/Pagination': mockedComponent,
    '../../Materialize/Headline': mockedComponent,
    './UserItem': mockedComponent
  })

  vm = new Vue({
    template: '<div><crudl-document index="index" collection="collection" v-ref:list></crudl-document></div>',
    components: {
      CrudlDocument
    },
    store: store
  }).$mount()

  vm.$refs.list.$router = {go}
  $broadcast = sandbox.stub(vm.$refs.list, '$broadcast')
}

describe('CrudlDocument component', () => {
  beforeEach(() => {
    initInjector()
  })

  afterEach(() => sandbox.restore())

  describe('Method', () => {
    describe('changePage', () => {
      it('should call the router with correct query parameter', () => {
        vm.$refs.list.$route = {query: {rawSearch: {toto: 'tutu'}}}

        vm.$refs.list.changePage(0)
        expect(go.calledWith({query: {rawSearch: {toto: 'tutu'}, from: 0}})).to.be.equal(true)

        vm.$refs.list.$route = {query: {rawSearch: {toto: 'tata'}}}
        vm.$refs.list.changePage(10)
        expect(go.calledWith({query: {rawSearch: {toto: 'tata'}, from: 10}})).to.be.equal(true)
      })
    })

    describe('confirmBulkDelete', () => {
      it('should dispatch event for closing the corresponding modal', () => {
        sandbox.stub(vm.$refs.list, 'deleteDocuments').returns(Promise.resolve())
        sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmBulkDelete()

        expect($broadcast.calledWith('modal-close', 'bulk-delete')).to.be.equal(true)
      })

      it('should call delete users with the right list and refresh the users list', (done) => {
        vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
        let deleteUsers = sandbox.stub(vm.$refs.list, 'deleteDocuments').returns(Promise.resolve())
        let refreshSearch = sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmBulkDelete()

        setTimeout(() => {
          expect(deleteUsers.calledWith('index', 'collection', ['doc1', 'doc2'])).to.be.equal(true)
          expect(refreshSearch.called).to.be.equal(true)
          done()
        }, 0)
      })

      it('should do nothing if delete was not a success', (done) => {
        sandbox.stub(vm.$refs.list, 'deleteDocuments').returns(Promise.reject(new Error()))
        let refreshSearch = sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmBulkDelete()

        setTimeout(() => {
          expect(refreshSearch.called).to.be.equal(false)
          done()
        }, 0)
      })
    })

    describe('confirmSingleDelete', () => {
      it('should dispatch event for closing the corresponding modal', () => {
        sandbox.stub(vm.$refs.list, 'deleteDocuments').returns(Promise.resolve())
        sandbox.stub(vm.$refs.list, 'refreshSearch')

        vm.$refs.list.confirmSingleDelete('id')

        expect($broadcast.calledWith('modal-close', 'single-delete')).to.be.equal(true)
      })
    })

    describe('quickSearch', () => {
      it('quick search must go on the route with a param search term', () => {
        vm.$refs.list.quickSearch('toto')
        expect(go.calledWith({query: {searchTerm: 'toto', from: 0}})).to.be.equal(true)

        vm.$refs.list.quickSearch('tutu')
        expect(go.calledWith({query: {searchTerm: 'tutu', from: 0}})).to.be.equal(true)
      })
    })

    describe('basicSearch', () => {
      it('should redirect on empty query if there is no filters and no sorting', () => {
        vm.$refs.list.basicSearch(null, null)
        expect(go.calledWith({query: {basicFilter: null, sorting: null, from: 0}})).to.be.equal(true)
      })

      it('should call go with right filter and sorting stringified', () => {
        let filter = {toto: 'tutu'}
        let sorting = {attribute: 'tata', order: 'asc'}
        vm.$refs.list.basicSearch(filter, sorting)

        expect(go.calledWith({query: {basicFilter: JSON.stringify(filter), sorting: JSON.stringify(sorting), from: 0}})).to.be.equal(true)
      })
    })

    describe('rawSearch', () => {
      it('should redirect on empty query if there is no filters', () => {
        vm.$refs.list.rawSearch(null)
        expect(go.calledWith({query: {rawFilter: null, from: 0}})).to.be.equal(true)

        vm.$refs.list.rawSearch({})
        vm.$broadcast('perform-search')
        expect(go.calledWith({query: {rawFilter: null, from: 0}})).to.be.equal(true)
      })

      it('should call go with right filter and sorting stringified', () => {
        let filter = {toto: 'tutu'}
        vm.$refs.list.rawSearch(filter)

        expect(go.calledWith({query: {rawFilter: JSON.stringify(filter), from: 0}})).to.be.equal(true)
      })
    })

    describe('refreshSearch', () => {
      it('should use existing query and reset from parameter', () => {
        vm.$refs.list.$route = {query: {basicFilter: "{toto: 'tutu'}"}}
        vm.$refs.list.refreshSearch()
        expect(go.calledWith({query: {basicFilter: "{toto: 'tutu'}", from: 0}})).to.be.equal(true)

        vm.$refs.list.$route = {query: {basicFilter: "{toto: 'tata'}"}}
        vm.$refs.list.refreshSearch()
        expect(go.calledWith({query: {basicFilter: "{toto: 'tata'}", from: 0}})).to.be.equal(true)
      })
    })

    describe('delete-document event tests', () => {
      it('should broadcast modal-open', () => {
        vm.$broadcast('delete-document', 'id')
        expect($broadcast.called).to.be.ok
      })
    })
  })
})
