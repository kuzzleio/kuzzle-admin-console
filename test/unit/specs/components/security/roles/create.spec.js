import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'
import Promise from 'bluebird'

let CreateInjector = require('!!vue?inject!../../../../../../src/components/Security/Roles/Create')
let Create
let sandbox = sinon.sandbox.create()

describe('Security roles create', () => {
  let vm
  let createRolePromise = sandbox.stub().returns(Promise.resolve())
  let refreshIndex = sandbox.stub()

  const mockInjector = () => {
    Create = CreateInjector({
      '../Common/CreateOrUpdate': mockedComponent,
      '../../../services/kuzzle': {
        security: {
          createRolePromise
        },
        refreshIndex
      }
    })

    vm = new Vue({
      template: '<div><create v-ref:create></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.create.$router = {go: sandbox.stub()}
  }

  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    describe('create', () => {
      it('should do nothing if id or content are null or empty', () => {
        createRolePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()

        vm.$refs.create.create()
        vm.$refs.create.create('toto')
        vm.$refs.create.create('toto', {})

        expect(createRolePromise.callCount).to.be.equal(0)
      })

      it('should set the error if kuzzle reject the promise', (done) => {
        createRolePromise = sandbox.stub().returns(Promise.reject(new Error('error from Kuzzle')))
        mockInjector()

        vm.$refs.create.create('toto', {toto: 'tutu'})

        setTimeout(() => {
          expect(refreshIndex.callCount).to.be.equal(0)
          expect(vm.$refs.create.error).to.be.equal('An error occurred while creating role: <br />error from Kuzzle')
          done()
        }, 0)
      })

      it('should call create role with right params, refresh and redirect', (done) => {
        createRolePromise = sandbox.stub().returns(Promise.resolve())
        mockInjector()

        vm.$refs.create.create('toto', {toto: 'tutu'})

        setTimeout(() => {
          expect(createRolePromise.calledWithMatch('toto', {toto: 'tutu'})).to.be.equal(true)
          expect(refreshIndex.calledWith('%kuzzle')).to.be.equal(true)
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
