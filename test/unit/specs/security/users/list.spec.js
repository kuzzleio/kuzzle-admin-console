import Vue from 'vue'
import List from '../../../../../src/components/Security/Users/List'
import store from '../../../../../src/vuex/store'

describe('Users list', () => {
  describe('Method', () => {
    it('changePage should call the router with correct page', () => {
      let vm = new Vue({
        template: '<div><list v-ref:list></list></div>',
        components: {
          List
        },
        store: store
      }).$mount()

      vm.$refs.list.$router = {go: sinon.spy()}

      vm.$refs.list.changePage(1)
      expect(vm.$refs.list.$router.go.calledWith({query: {page: 1}})).to.be.equal(true)

      vm.$refs.list.changePage(2)
      expect(vm.$refs.list.$router.go.calledWith({query: {page: 2}})).to.be.equal(true)
    })
  })

  describe('route data', () => {
    it('should call searchUsers with right parameters', () => {
      List.route.searchUsers = sinon.spy()

      List.route.limit = 10
      List.route.$route = {query: {}}
      List.route.data()
      expect(List.route.searchUsers.calledWith({from: 0, size: 10})).to.be.equal(true)

      List.route.limit = 10
      List.route.$route = {query: {page: 10}}
      List.route.data()
      expect(List.route.searchUsers.calledWith({from: 90, size: 10})).to.be.equal(true)
    })
  })
})
