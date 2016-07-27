import Vue from 'vue'
import store from '../../../../../src/vuex/store'

let ListInjector = require('inject?../../../../../src/services/filterFormat!../../../../../src/components/Security/Users/List')

describe('Users list', () => {
  let List = {}

  beforeEach(() => {
    List = ListInjector()
  })

  describe('Method', () => {
    describe('changePage', () => {
      it('should call the router with correct page', () => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.$router = {go: sinon.spy()}

        vm.$refs.list.changePage(0)
        expect(vm.$refs.list.$router.go.calledWith({query: {from: 0}})).to.be.equal(true)

        vm.$refs.list.changePage(10)
        expect(vm.$refs.list.$router.go.calledWith({query: {from: 10}})).to.be.equal(true)
      })
    })

    describe('confirmBulkDelete', () => {
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
        vm.$refs.list.searchUsers = sinon.stub()

        vm.$refs.list.confirmBulkDelete()

        expect(vm.$refs.list.$broadcast.calledWith('modal-close', 'bulk-delete')).to.be.equal(true)
      })

      it('should call delete users with the right list', (done) => {
        let vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()

        vm.$refs.list.deleteUsers = sinon.stub().returns(Promise.resolve())
        vm.$refs.list.searchUsers = sinon.spy()

        vm.$refs.list.toggleSelectDocuments('doc1')
        vm.$refs.list.confirmBulkDelete()
        expect(vm.$refs.list.deleteUsers.calledWith(['doc1'])).to.be.equal(true)

        vm.$refs.list.toggleSelectDocuments('doc2')
        vm.$refs.list.confirmBulkDelete()
        expect(vm.$refs.list.deleteUsers.calledWith(['doc1', 'doc2'])).to.be.equal(true)

        setTimeout(() => {
          expect(vm.$refs.list.searchUsers.calledTwice).to.be.equal(true)
          done()
        }, 0)
      })
    })
  })

  describe('route data', () => {
    let injectedList = {}
    let formatFromQuickSearch = sinon.stub()
    let formatFromBasicSearch = sinon.stub()

    before(() => {
      injectedList = ListInjector({
        '../../../../../src/services/filterFormat': {
          formatFromQuickSearch,
          formatFromBasicSearch
        }
      })

      injectedList.route.performSearch = sinon.spy()
    })

    it('should call performSearch with no filter if there is nothing in $route', () => {
      injectedList.route.initSearch = {}
      injectedList.$route = {query: {}}

      injectedList.route.data()
      expect(injectedList.route.performSearch.calledWith('users', '%kuzzle', {}, [])).to.be.equal(true)
    })

    it('should call performSearch with quick search', () => {
      formatFromQuickSearch.returns({toto: 'tutu'})
      injectedList.$route = {query: {quickSearch: 'test'}}
      injectedList.route.data()

      console.log(formatFromQuickSearch.args)
      expect(formatFromQuickSearch.calledWith(injectedList.$route.query.quickSearch)).to.be.equal(true)
      // expect(injectedList.route.performSearch.calledWith('users', '%kuzzle', {toto: 'tutu'}, [])).to.be.equal(true)
    })
  })
})
