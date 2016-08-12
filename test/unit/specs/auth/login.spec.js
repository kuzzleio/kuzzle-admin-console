import Login from '../../../../src/components/Login'
import Vue from 'vue'
import store from '../../../../src/vuex/store'
import Promise from 'bluebird'

describe('Login.vue', () => {
  describe('methods Tests', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><login v-ref:login></login></div>',
        components: {Login},
        replace: false,
        store: store
      }).$mount()

      vm.$refs.login.$router = {go: sinon.stub()}
    })

    it('should reject a promise and set an error', (done) => {
      vm.$refs.login.doLogin = sinon.stub().returns(Promise.reject(new Error('error')))
      vm.$refs.login.login('username', 'password')

      setTimeout(() => {
        expect(vm.$refs.login.error).to.equals('error')
        done()
      }, 0)
    })

    it('should reject a promise and set an error', (done) => {
      vm.$refs.login.doLogin = sinon.stub().returns(Promise.resolve())
      vm.$refs.login.login('username', 'password')

      setTimeout(() => {
        expect(vm.$refs.login.error).to.be.null
        done()
      }, 0)
    })
  })
})
