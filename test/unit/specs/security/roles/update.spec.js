import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import { mockedComponent } from '../../helper'
import Promise from 'bluebird'

let UpdateInjector = require('!!vue?inject!../../../../../src/components/Security/Roles/Update')
let Update
let sandbox = sinon.sandbox.create()

describe.only('Security roles update', () => {
  let vm
  let $dispatch
  let updateRolePromise = sandbox.stub().returns(Promise.resolve())
  let refreshIndex = sandbox.stub()

  const mockInjector = () => {
    Update = UpdateInjector({
      '../Common/Create': mockedComponent,
      '../../../services/kuzzle': {
        security: {
          updateRolePromise
        },
        refreshIndex
      }
    })

    vm = new Vue({
      template: '<div><update v-ref:update></update></div>',
      components: {Update},
      replace: false,
      store: store
    }).$mount()

    $dispatch = sandbox.stub(vm.$refs.create, '$dispatch')
    vm.$refs.update.$router = {go: sandbox.stub()}
  }

  describe('Methods', () => {
    describe('update', () => {
      it('should do nothing if content is null or empty', () => {
        updateRolePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()

        vm.$refs.update.update()
        vm.$refs.update.update({})

        expect(updateRolePromise.callCount).to.be.equal(0)
      })

      it('should call the toaster with the error', (done) => {
        updateRolePromise = sandbox.stub().returns(Promise.reject(new Error('error from Kuzzle')))
        mockInjector()

        vm.$refs.update.update({toto: 'tutu'})

        setTimeout(() => {
          expect(refreshIndex.callCount).to.be.equal(0)
          expect($dispatch.calledWith('toast', 'error from Kuzzle', 'error')).to.be.equal(true)
          done()
        }, 0)
      })

      it('should call update role with right params, refresh and redirect', (done) => {
        updateRolePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()

        vm.$refs.update.$route = {params: {id: 'toto'}}
        vm.$refs.update.update({toto: 'tutu'})

        setTimeout(() => {
          expect(updateRolePromise.calledWithMatch('toto', {toto: 'tutu'})).to.be.equal(true)
          expect(vm.$refs.create.$router.go.calledWithMatch({name: 'SecurityRolesList'})).to.be.equal(true)
          done()
        }, 0)
      })
    })

    describe('cancel', () => {
      it('should redirect on the list', () => {
        mockInjector()
        vm.$refs.create.cancel()

        expect(vm.$refs.create.$router.go.calledWithMatch({name: 'SecurityRolesList'})).to.be.equal(true)
      })
    })
  })
})
