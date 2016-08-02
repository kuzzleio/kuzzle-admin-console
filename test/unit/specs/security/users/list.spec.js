import Vue from 'vue'
import List from '../../../../../src/components/Security/Users/List'
import store from '../../../../../src/vuex/store'

describe('Users list', () => {
  describe('Method', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><list v-ref:list></list></div>',
        components: {
          List
        },
        store: store
      }).$mount()
    })

    describe('changePage', () => {
      it('should call the router with correct page', () => {
        vm.$refs.list.$router = {go: sinon.spy()}

        vm.$refs.list.changePage(1)
        expect(vm.$refs.list.$router.go.calledWith({query: {page: 1}})).to.be.equal(true)

        vm.$refs.list.changePage(2)
        expect(vm.$refs.list.$router.go.calledWith({query: {page: 2}})).to.be.equal(true)
      })
    })

    describe('confirmBulkDelete', () => {
      it('should dispatch event for close the corresponding modal', () => {
        vm.$refs.list.$broadcast = sinon.spy()
        vm.$refs.list.deleteUsers = sinon.stub().returns(Promise.resolve())
        vm.$refs.list.searchUsers = sinon.stub()

        vm.$refs.list.confirmBulkDelete()

        expect(vm.$refs.list.$broadcast.calledWith('modal-close', 'bulk-delete')).to.be.equal(true)
      })

      it('should call delete users with the right list', (done) => {
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

    describe('confirmUserDelete', () => {
      it('should call deleteUser with the right id', (done) => {
        vm.$refs.list.deleteUser = sinon.stub().returns(Promise.resolve())
        vm.$refs.list.searchUsers = sinon.spy()
        vm.$refs.list.confirmUserDelete()
        setTimeout(() => {
          expect(vm.$refs.list.searchUsers.called).to.be.ok
          done()
        }, 0)
      })
    })
  })

  describe('route data', () => {
    it('should call searchUsers with right parameters', () => {
      List.route.searchUsers = sinon.spy()
      List.route.setPagination = sinon.spy()

      List.route.limit = 10
      List.route.$route = {query: {}}
      List.route.data()
      expect(List.route.setPagination.calledWith(1, 10)).to.be.equal(true)
      expect(List.route.searchUsers.calledOnce).to.be.equal(true)

      List.route.limit = 10
      List.route.$route = {query: {page: 10}}
      List.route.data()
      expect(List.route.setPagination.calledWith(10, 10)).to.be.equal(true)
      expect(List.route.searchUsers.calledTwice).to.be.equal(true)
    })
  })
})
