import Vue from 'vue'
import { mockedComponent } from '../../helper'
import store from '../../../../../src/vuex/store'

let ListInjector = require('!!vue?inject!../../../../../src/components/Security/Users/List')
import Promise from 'bluebird'

describe('Users list', () => {
  var List = {}

  describe('Computed', () => {
    it('displayBulkDelete should returns false if selectedDocuments is empty', () => {
      List = ListInjector({
        '../../../vuex/modules/collection/getters': {
          documents: sinon.stub().returns([]),
          totalDocuments: sinon.stub(),
          selectedDocuments: sinon.stub().returns([]),
          paginationFrom: sinon.stub(),
          paginationSize: sinon.stub(),
          searchTerm: sinon.stub(),
          rawFilter: sinon.stub(),
          basicFilter: sinon.stub(),
          sorting: sinon.stub(),
          basicFilterForm: sinon.stub()
        },
        '../../Common/Filters/Filters': mockedComponent,
        '../../Materialize/Modal': mockedComponent,
        '../../Materialize/Dropdown': mockedComponent,
        '../../Materialize/Pagination': mockedComponent,
        '../../Materialize/Headline': mockedComponent,
        './UserItem': mockedComponent
      })

      let vm = new Vue({
        template: '<div><list v-ref:list></list></div>',
        components: {
          List
        },
        store: store
      }).$mount()

      expect(vm.$refs.list.displayBulkDelete).to.be.equal(false)
    })

    it('displayBulkDelete should returns true if selectedDocuments is not empty', () => {
      List = ListInjector({
        '../../../vuex/modules/collection/getters': {
          documents: sinon.stub().returns([]),
          totalDocuments: sinon.stub(),
          selectedDocuments: sinon.stub().returns(['doc1']),
          paginationFrom: sinon.stub(),
          paginationSize: sinon.stub(),
          searchTerm: sinon.stub(),
          rawFilter: sinon.stub(),
          basicFilter: sinon.stub(),
          sorting: sinon.stub(),
          basicFilterForm: sinon.stub()
        },
        '../../Common/Filters/Filters': mockedComponent,
        '../../Materialize/Modal': mockedComponent,
        '../../Materialize/Dropdown': mockedComponent,
        '../../Materialize/Pagination': mockedComponent,
        '../../Materialize/Headline': mockedComponent,
        './UserItem': mockedComponent
      })

      let vm = new Vue({
        template: '<div><list v-ref:list></list></div>',
        components: {
          List
        },
        store: store
      }).$mount()

      expect(vm.$refs.list.displayBulkDelete).to.be.equal(true)
    })
  })

  describe('Method', () => {
    before(() => {
      List = ListInjector({
        '../../../vuex/modules/collection/getters': {
          documents: sinon.stub().returns([]),
          totalDocuments: sinon.stub(),
          selectedDocuments: sinon.stub(),
          paginationFrom: sinon.stub(),
          paginationSize: sinon.stub(),
          searchTerm: sinon.stub(),
          rawFilter: sinon.stub(),
          basicFilter: sinon.stub(),
          sorting: sinon.stub(),
          basicFilterForm: sinon.stub()
        },
        '../../Common/Filters/Filters': mockedComponent,
        '../../Materialize/Modal': mockedComponent,
        '../../Materialize/Dropdown': mockedComponent,
        '../../Materialize/Pagination': mockedComponent,
        '../../Materialize/Headline': mockedComponent,
        './UserItem': mockedComponent
      })
    })

    describe('changePage', () => {
      it('should call the router with correct query parameter', () => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$router = {go: sinon.spy()}
        vm.$refs.list.$route = {query: {rawSearch: {toto: 'tutu'}}}

        vm.$refs.list.changePage(0)
        expect(vm.$refs.list.$router.go.calledWith({query: {rawSearch: {toto: 'tutu'}, from: 0}})).to.be.equal(true)

        vm.$refs.list.$route = {query: {rawSearch: {toto: 'tata'}}}
        vm.$refs.list.changePage(10)
        expect(vm.$refs.list.$router.go.calledWith({query: {rawSearch: {toto: 'tata'}, from: 10}})).to.be.equal(true)
      })
    })

    describe('confirmBulkDelete', () => {
      before(() => {
        List = ListInjector({
          '../../../vuex/modules/collection/getters': {
            documents: sinon.stub().returns([]),
            totalDocuments: sinon.stub(),
            selectedDocuments: sinon.stub().returns(['doc1', 'doc2']),
            paginationFrom: sinon.stub(),
            paginationSize: sinon.stub(),
            searchTerm: sinon.stub(),
            rawFilter: sinon.stub(),
            basicFilter: sinon.stub(),
            sorting: sinon.stub(),
            basicFilterForm: sinon.stub()
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })
      })

      it('should dispatch event for close the corresponding modal', () => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$broadcast = sinon.spy()
        vm.$refs.list.deleteUsers = sinon.stub().returns(Promise.resolve())
        vm.$refs.list.refreshSearch = sinon.stub()

        vm.$refs.list.confirmBulkDelete()

        expect(vm.$refs.list.$broadcast.calledWith('modal-close', 'bulk-delete')).to.be.equal(true)
      })

      it('should call delete users with the right list and refresh the users list', (done) => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$broadcast = sinon.stub()
        vm.$refs.list.refreshSearch = sinon.spy()
        vm.$refs.list.deleteUsers = sinon.stub().returns(Promise.resolve())

        vm.$refs.list.confirmBulkDelete()

        setTimeout(() => {
          expect(vm.$refs.list.deleteUsers.calledWith(['doc1', 'doc2'])).to.be.equal(true)
          expect(vm.$refs.list.refreshSearch.called).to.be.equal(true)
          done()
        }, 0)
      })

      it('should do nothing if delete was not a success', (done) => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$broadcast = sinon.stub()
        vm.$refs.list.refreshSearch = sinon.spy()
        vm.$refs.list.deleteUsers = sinon.stub().returns(Promise.reject(new Error()))

        vm.$refs.list.confirmBulkDelete()

        setTimeout(() => {
          expect(vm.$refs.list.refreshSearch.called).to.be.equal(false)
          done()
        }, 0)
      })
    })

    describe('quickSearch', () => {
      before(() => {
        List = ListInjector({
          '../../../vuex/modules/collection/getters': {
            documents: sinon.stub().returns([]),
            totalDocuments: sinon.stub(),
            selectedDocuments: sinon.stub(),
            paginationFrom: sinon.stub(),
            paginationSize: sinon.stub(),
            searchTerm: sinon.stub(),
            rawFilter: sinon.stub(),
            basicFilter: sinon.stub(),
            sorting: sinon.stub(),
            basicFilterForm: sinon.stub()
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })
      })

      it('quick search must go on the route with a param search term', () => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$router = {go: sinon.spy()}
        vm.$refs.list.quickSearch('toto')
        expect(vm.$refs.list.$router.go.calledWith({query: {searchTerm: 'toto', from: 0}})).to.be.equal(true)

        vm.$refs.list.quickSearch('tutu')
        expect(vm.$refs.list.$router.go.calledWith({query: {searchTerm: 'tutu', from: 0}})).to.be.equal(true)
      })
    })

    describe('basicSearch', () => {
      let vm = {}

      before(() => {
        List = ListInjector({
          '../../../vuex/modules/collection/getters': {
            documents: sinon.stub().returns([]),
            totalDocuments: sinon.stub(),
            selectedDocuments: sinon.stub(),
            paginationFrom: sinon.stub(),
            paginationSize: sinon.stub(),
            searchTerm: sinon.stub(),
            rawFilter: sinon.stub(),
            basicFilter: sinon.stub(),
            sorting: sinon.stub(),
            basicFilterForm: sinon.stub()
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$router = {go: sinon.spy()}
      })

      it('should redirect on empty query if there is no filters and no sorting', () => {
        vm.$refs.list.basicSearch(null, null)
        expect(vm.$refs.list.$router.go.calledWith({query: {basicFilter: null, sorting: null, from: 0}})).to.be.equal(true)
      })

      it('should call go with right filter and sorting stringified', () => {
        let filter = {toto: 'tutu'}
        let sorting = {attribute: 'tata', order: 'asc'}
        vm.$refs.list.basicSearch(filter, sorting)

        expect(vm.$refs.list.$router.go.calledWith({query: {basicFilter: JSON.stringify(filter), sorting: JSON.stringify(sorting), from: 0}})).to.be.equal(true)
      })
    })

    describe('rawSearch', () => {
      let vm = {}

      before(() => {
        List = ListInjector({
          '../../../vuex/modules/collection/getters': {
            documents: sinon.stub().returns([]),
            totalDocuments: sinon.stub(),
            selectedDocuments: sinon.stub(),
            paginationFrom: sinon.stub(),
            paginationSize: sinon.stub(),
            searchTerm: sinon.stub(),
            rawFilter: sinon.stub(),
            basicFilter: sinon.stub(),
            sorting: sinon.stub(),
            basicFilterForm: sinon.stub()
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$router = {go: sinon.spy()}
      })

      it('should redirect on empty query if there is no filters', () => {
        vm.$refs.list.rawSearch(null)
        expect(vm.$refs.list.$router.go.calledWith({query: {rawFilter: null, from: 0}})).to.be.equal(true)

        vm.$refs.list.rawSearch({})
        expect(vm.$refs.list.$router.go.calledWith({query: {rawFilter: null, from: 0}})).to.be.equal(true)
      })

      it('should call go with right filter and sorting stringified', () => {
        let filter = {toto: 'tutu'}
        vm.$refs.list.rawSearch(filter)

        expect(vm.$refs.list.$router.go.calledWith({query: {rawFilter: JSON.stringify(filter), from: 0}})).to.be.equal(true)
      })
    })

    describe('refreshSearch', () => {
      let vm = {}

      before(() => {
        List = ListInjector({
          '../../../vuex/modules/collection/getters': {
            documents: sinon.stub().returns([]),
            totalDocuments: sinon.stub(),
            selectedDocuments: sinon.stub(),
            paginationFrom: sinon.stub(),
            paginationSize: sinon.stub(),
            searchTerm: sinon.stub(),
            rawFilter: sinon.stub(),
            basicFilter: sinon.stub(),
            sorting: sinon.stub(),
            basicFilterForm: sinon.stub()
          },
          '../../Common/Filters/Filters': mockedComponent,
          '../../Materialize/Modal': mockedComponent,
          '../../Materialize/Dropdown': mockedComponent,
          '../../Materialize/Pagination': mockedComponent,
          '../../Materialize/Headline': mockedComponent,
          './UserItem': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$router = {go: sinon.spy()}
      })

      it('should use existing query and reset from parameter', () => {
        vm.$refs.list.$route = {query: {basicFilter: "{toto: 'tutu'}"}}
        vm.$refs.list.refreshSearch()
        expect(vm.$refs.list.$router.go.calledWith({query: {basicFilter: "{toto: 'tutu'}", from: 0}})).to.be.equal(true)

        vm.$refs.list.$route = {query: {basicFilter: "{toto: 'tata'}"}}
        vm.$refs.list.refreshSearch()
        expect(vm.$refs.list.$router.go.calledWith({query: {basicFilter: "{toto: 'tata'}", from: 0}})).to.be.equal(true)
      })
    })
  })

  describe('route data', () => {
    beforeEach(() => {
      List = ListInjector({
        '../../../services/filterFormat': {
          formatFromQuickSearch: sinon.stub().returns({quick: 'filter1'}),
          formatFromBasicSearch: sinon.stub().returns({basic: 'filter1'}),
          formatSort: sinon.stub().returns([{attribute: 'attribute1'}])
        }
      })

      List.route.searchTerm = null
      List.route.rawFilter = null
      List.route.basicFilter = null
      List.route.sorting = null
      List.route.paginationFrom = 0
      List.route.paginationSize = 10
      List.route.performSearch = sinon.spy()
    })

    it('should call performSearch with only pagination if there is nothing in store', () => {
      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {}, {from: 0, size: 10}, [])).to.be.equal(true)

      List.route.paginationFrom = 10
      List.route.paginationSize = 100

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {}, {from: 10, size: 100}, [])).to.be.equal(true)
    })

    it('should call performSearch with searchTerm if is set in store', () => {
      List.route.searchTerm = true

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {quick: 'filter1'}, {from: 0, size: 10}, [])).to.be.equal(true)
    })

    it('should call performSearch with basicFilter if is set in store', () => {
      List.route.basicFilter = true

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {basic: 'filter1'}, {from: 0, size: 10}, [])).to.be.equal(true)
    })

    it('should call performSearch with rawFilter and sort if is set in store', () => {
      List.route.rawFilter = {raw: 'filter1'}

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {raw: 'filter1'}, {from: 0, size: 10}, [])).to.be.equal(true)

      List.route.rawFilter = {raw: 'filter2', sort: [{attribute: 'attribute'}]}

      List.route.data()
      expect(List.route.performSearch.calledWith('users',
        '%kuzzle',
        {raw: 'filter2', sort: [{attribute: 'attribute'}]},
        {from: 0, size: 10},
        [{attribute: 'attribute'}])
      ).to.be.equal(true)
    })

    it('should call performSearch with sorting if is set in store', () => {
      List.route.sorting = true

      List.route.data()
      expect(List.route.performSearch.calledWith('users', '%kuzzle', {}, {from: 0, size: 10}, [{attribute: 'attribute1'}])).to.be.equal(true)
    })
  })
})
