import Vue from 'vue'
import store from '../../../../src/vuex/store'
import Promise from 'bluebird'

let SignupInjector = require('!!vue?inject!../../../../src/components/Signup')

describe('Signup component', () => {
  let Signup
  let vm
  let sandbox = sinon.sandbox.create()
  let queryPromise

  const mockInjector = (error) => {
    if (error) {
      queryPromise = sandbox.stub().returns(Promise.reject(new Error()))
    } else {
      queryPromise = sandbox.stub().returns(Promise.resolve())
    }

    Signup = SignupInjector({
      '../services/kuzzle': {queryPromise},
      '../vuex/modules/auth/actions': {
        setFirstAdmin: sandbox.stub()
      }
    })

    vm = new Vue({
      template: '<div><signup v-ref:signup></signup></div>',
      components: {
        Signup
      },
      store: store
    }).$mount()

    vm.$refs.signup.$router = {go: sandbox.stub()}
    vm.$refs.signup.setFirstAdmin = sandbox.stub()
  }

  afterEach(() => sandbox.reset())

  describe('Methods', () => {
    describe('signup', () => {
      it('should set error if one of required fields is empty', () => {
        mockInjector(false)
        vm.$refs.signup.username = ''
        vm.$refs.signup.password1 = 'toto'
        vm.$refs.signup.password2 = 'toto'

        vm.$refs.signup.signup()
        expect(vm.$refs.signup.error).be.equal('All fields are mandatory')

        vm.$refs.signup.username = 'toto'
        vm.$refs.signup.password1 = ''
        vm.$refs.signup.password2 = 'toto'

        vm.$refs.signup.signup()
        expect(vm.$refs.signup.error).be.equal('All fields are mandatory')

        vm.$refs.signup.username = 'toto'
        vm.$refs.signup.password1 = 'toto'
        vm.$refs.signup.password2 = ''

        vm.$refs.signup.signup()
        expect(vm.$refs.signup.error).be.equal('All fields are mandatory')
      })

      it('should set error if password does not match', () => {
        mockInjector(false)
        vm.$refs.signup.username = 'toto'
        vm.$refs.signup.password1 = 'pass1'
        vm.$refs.signup.password2 = 'pass2'

        vm.$refs.signup.signup()
        expect(vm.$refs.signup.error).be.equal('Password does not match')
      })

      it('should set waiting if everything is fine', () => {
        mockInjector(false)
        vm.$refs.signup.username = 'toto'
        vm.$refs.signup.password1 = 'toto'
        vm.$refs.signup.password2 = 'toto'

        vm.$refs.signup.signup()
        expect(vm.$refs.signup.waiting).be.equal(true)
      })

      it('should redirect on Login if there is an error', (done) => {
        mockInjector(true)
        vm.$refs.signup.username = 'toto'
        vm.$refs.signup.password1 = 'toto'
        vm.$refs.signup.password2 = 'toto'

        vm.$refs.signup.signup()

        setTimeout(() => {
          expect(vm.$refs.signup.setFirstAdmin.callCount).be.equal(0)
          expect(vm.$refs.signup.$router.go.calledWithMatch({name: 'Login'})).be.equal(true)
          done()
        }, 0)
      })

      it('should call setFirstAdmin and redirect to Login if everything is ok', (done) => {
        mockInjector(false)
        vm.$refs.signup.username = 'toto'
        vm.$refs.signup.password1 = 'toto'
        vm.$refs.signup.password2 = 'toto'

        vm.$refs.signup.signup()

        setTimeout(() => {
          expect(vm.$refs.signup.setFirstAdmin.calledWith(true)).be.equal(true)
          expect(vm.$refs.signup.$router.go.calledWithMatch({name: 'Login'})).be.equal(true)
          done()
        }, 0)
      })

      it('should call queryPromise with right username/password and reset false', (done) => {
        mockInjector(false)

        vm.$refs.signup.username = 'username'
        vm.$refs.signup.password1 = 'pass'
        vm.$refs.signup.password2 = 'pass'
        vm.$refs.signup.reset = false

        vm.$refs.signup.signup()

        setTimeout(() => {
          expect(
            queryPromise.calledWithMatch(
              {controller: 'admin', action: 'createFirstAdmin'},
              {_id: 'username', body: {username: 'username', password: 'pass', reset: false}}
            )
          ).be.equal(true)
          done()
        }, 0)
      })

      it('should call queryPromise with right username/password and reset true', (done) => {
        mockInjector(false)

        vm.$refs.signup.username = 'username2'
        vm.$refs.signup.password1 = 'pass2'
        vm.$refs.signup.password2 = 'pass2'
        vm.$refs.signup.reset = true

        vm.$refs.signup.signup()

        setTimeout(() => {
          expect(
            queryPromise.calledWithMatch(
              {controller: 'admin', action: 'createFirstAdmin'},
              {_id: 'username2', body: {username: 'username2', password: 'pass2', reset: true}}
            )
          ).be.equal(true)
          done()
        }, 0)
      })
    })
  })
})
