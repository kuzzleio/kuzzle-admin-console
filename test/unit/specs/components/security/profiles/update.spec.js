import Vue from 'vue'
import { mockedComponent } from '../../../helper'
import Promise from 'bluebird'

let UpdateInjector = require('!!vue?inject!../../../../../../src/components/Security/Profiles/Update')
let Update
let sandbox = sinon.sandbox.create()

describe('Security profiles update', () => {
  let vm
  let $dispatch
  let updateProfilePromise = sandbox.stub().returns(Promise.resolve())
  let getProfilePromise = sandbox.stub().returns(Promise.resolve({id: 'toto', content: {}}))

  const mockInjector = () => {
    Update = UpdateInjector({
      '../Common/CreateOrUpdate': mockedComponent,
      '../../../services/kuzzle': {
        security: {
          updateProfilePromise,
          getProfilePromise
        }
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<app></app>')
    $dispatch = sandbox.stub(Vue.prototype, '$dispatch')
    vm = new Vue({
      template: '<div><update v-ref:update></update></div>',
      components: {Update}
    })

    vm.$router = {go: sandbox.stub(), _children: {push: sandbox.stub()}}
    vm.$route = {params: {id: 'toto'}}
  }

  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    describe('update', () => {
      it('should do nothing if content is null or empty', () => {
        updateProfilePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.update()
        vm.$refs.update.update({})

        expect(updateProfilePromise.callCount).to.be.equal(0)
      })

      it('should call the toaster with the error', (done) => {
        updateProfilePromise = sandbox.stub().returns(Promise.reject(new Error('error from Kuzzle')))
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.update({toto: 'tutu'})

        setTimeout(() => {
          expect($dispatch.calledWith('toast', 'error from Kuzzle', 'error')).to.be.equal(true)
          done()
        }, 0)
      })

      it('should call update profile with right params, refresh and redirect', (done) => {
        updateProfilePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.update({toto: 'tutu'})

        setTimeout(() => {
          expect(updateProfilePromise.calledWithMatch('toto', {toto: 'tutu'})).to.be.equal(true)
          expect(vm.$refs.update.$router.go.calledWithMatch({name: 'SecurityProfilesList'})).to.be.equal(true)
          done()
        }, 0)
      })
    })

    describe('cancel', () => {
      it('should redirect on the list', () => {
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.cancel()

        expect(vm.$refs.update.$router.go.calledWithMatch({name: 'SecurityProfilesList'})).to.be.equal(true)
      })
    })
  })

  describe('Ready', () => {
    it('should toast an error and redirect on create on kuzzle error', (done) => {
      getProfilePromise = sandbox.stub().returns(Promise.reject(new Error('error from Kuzzle')))
      mockInjector()
      vm.$mount('app')

      setTimeout(() => {
        expect($dispatch.calledWith('toast', 'error from Kuzzle', 'error')).to.be.equal(true)
        expect(vm.$refs.update.$router.go.calledWithMatch({name: 'SecurityProfilesCreate'})).to.be.equal(true)
        done()
      }, 0)
    })

    it('should assign id and content', (done) => {
      let profile = {id: 'toto', content: {toto: 'tutu'}}
      getProfilePromise = sandbox.stub().returns(Promise.resolve(profile))
      mockInjector()
      vm.$mount('app')

      setTimeout(() => {
        expect(vm.$refs.update.id).to.be.equal(profile.id)
        expect(vm.$refs.update.content).to.be.equal(profile.content)
        done()
      }, 0)
    })
  })
})
