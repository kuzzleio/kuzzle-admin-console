import Vue from 'vue'
import Promise from 'bluebird'

let SignupInjector = require('!!vue?inject!../../../../src/components/Signup')
import {mockedComponent} from '../helper'

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
      './Common/Environments/Switch': mockedComponent
    })

    vm = new Vue(Signup).$mount()

    vm.$store = {commit: sandbox.stub()}
    vm.$router = {push: sandbox.stub()}
  }

  afterEach(() => sandbox.reset())

  mockInjector(false)

  describe('Methods', () => {
    describe('signup', () => {
      it('should set error if one of required fields is empty', () => {
        vm.username = ''
        vm.password1 = 'toto'
        vm.password2 = 'toto'

        vm.signup()
        expect(vm.error).be.equal('All fields are mandatory')

        vm.username = 'toto'
        vm.password1 = ''
        vm.password2 = 'toto'

        vm.signup()
        expect(vm.error).be.equal('All fields are mandatory')

        vm.username = 'toto'
        vm.password1 = 'toto'
        vm.password2 = ''

        vm.signup()
        expect(vm.error).be.equal('All fields are mandatory')
      })

      it('should set error if password does not match', () => {
        vm.username = 'toto'
        vm.password1 = 'pass1'
        vm.password2 = 'pass2'

        vm.signup()
        expect(vm.error).be.equal('Password does not match')
      })

      it('should set waiting if everything is fine', () => {
        vm.username = 'toto'
        vm.password1 = 'toto'
        vm.password2 = 'toto'

        vm.signup()
        expect(vm.waiting).be.equal(true)
      })

      /*
      * Due to problems with vue and inject loader it seems I can't instantiate
      * another injected component. I'm commenting this until I find a fix
      */

      // it('should redirect on Login if there is an error', (done) => {
      //   mockInjector(true)
      //   vm.username = 'toto'
      //   vm.password1 = 'toto'
      //   vm.password2 = 'toto'
      //
      //   vm.signup()
      //
      //   setTimeout(() => {
      //     expect(vm.$store.commit.callCount).be.equal(0)
      //     expect(vm.$router.push.calledWithMatch({name: 'Login'})).be.equal(true)
      //     done()
      //   }, 0)
      // })

      it('should call setFirstAdmin and redirect to Login if everything is ok', (done) => {
        vm.username = 'toto'
        vm.password1 = 'toto'
        vm.password2 = 'toto'

        vm.signup()

        setTimeout(() => {
          expect(vm.$router.push.calledWithMatch({name: 'Login'})).be.equal(true)
          done()
        }, 0)
      })

      it('should call queryPromise with right username/password and reset false', (done) => {
        vm.username = 'username'
        vm.password1 = 'pass'
        vm.password2 = 'pass'
        vm.reset = false

        vm.signup()

        setTimeout(() => {
          expect(
            queryPromise.calledWithMatch(
              {controller: 'security', action: 'createFirstAdmin'},
              {_id: 'username', body: {username: 'username', password: 'pass', reset: false}}
            )
          ).be.equal(true)
          done()
        }, 0)
      })

      it('should call queryPromise with right username/password and reset true', (done) => {
        vm.username = 'username2'
        vm.password1 = 'pass2'
        vm.password2 = 'pass2'
        vm.reset = true

        vm.signup()

        setTimeout(() => {
          expect(
            queryPromise.calledWithMatch(
              {controller: 'security', action: 'createFirstAdmin'},
              {_id: 'username2', body: {username: 'username2', password: 'pass2', reset: true}}
            )
          ).be.equal(true)
          done()
        }, 0)
      })
    })
  })
})
