import Vue from 'vue'
import { mockedComponent } from '../../helper'
import Promise from 'bluebird'

let UpdateInjector = require('!!vue?inject!../../../../../src/components/Security/Roles/Update')
let Update
let sandbox = sinon.sandbox.create()

describe('Security roles update', () => {
  let vm
  let $dispatch
  let updateRolePromise = sandbox.stub().returns(Promise.resolve())
  let getRolePromise = sandbox.stub().returns(Promise.resolve({id: 'toto', content: {}}))

  const mockInjector = () => {
    Update = UpdateInjector({
      '../Common/Create': mockedComponent,
      '../../../services/kuzzle': {
        security: {
          updateRolePromise,
          getRolePromise
        }
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<app></app>')
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
        updateRolePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.update()
        vm.$refs.update.update({})

        expect(updateRolePromise.callCount).to.be.equal(0)
      })

      it('should call the toaster with the error', (done) => {
        updateRolePromise = sandbox.stub().returns(Promise.reject(new Error('error from Kuzzle')))
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.update({toto: 'tutu'})

        setTimeout(() => {
          expect($dispatch.calledWith('toast', 'error from Kuzzle', 'error')).to.be.equal(true)
          done()
        }, 0)
      })

      it('should call update role with right params, refresh and redirect', (done) => {
        updateRolePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.update({toto: 'tutu'})

        setTimeout(() => {
          expect(updateRolePromise.calledWithMatch('toto', {toto: 'tutu'})).to.be.equal(true)
          expect(vm.$refs.update.$router.go.calledWithMatch({name: 'SecurityRolesList'})).to.be.equal(true)
          done()
        }, 0)
      })
    })

    describe('cancel', () => {
      it('should redirect on the list', () => {
        mockInjector()
        vm.$mount('app')

        vm.$refs.update.cancel()

        expect(vm.$refs.update.$router.go.calledWithMatch({name: 'SecurityRolesList'})).to.be.equal(true)
      })
    })
  })

  describe.only('Ready', () => {
    it('should toast an error and redirect on create on kuzzle error', (done) => {
      getRolePromise = sandbox.stub().returns(Promise.reject(new Error('error from Kuzzle')))
      mockInjector()
      $dispatch = sandbox.stub(vm, '$dispatch')
      vm.$mount('app')

      setTimeout(() => {
        expect($dispatch.calledWith('toast', 'error from Kuzzle', 'error')).to.be.equal(true)
        expect(vm.$refs.update.$router.go.calledWithMatch({name: 'SecurityRolesCreate'})).to.be.equal(true)
        done()
      }, 0)
    })

    it('should assign id and content', (done) => {
      let role = {id: 'toto', content: {toto: 'tutu'}}
      getRolePromise = sandbox.stub().returns(Promise.resolve(role))
      mockInjector()
      vm.$mount('app')

      setTimeout(() => {
        expect(vm.$refs.update.id).to.be.equal(role.id)
        expect(vm.$refs.update.content).to.be.equal(role.content)
        done()
      }, 0)
    })
  })
})
