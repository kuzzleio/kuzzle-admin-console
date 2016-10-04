import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let SwitchInjector = require('!!vue?inject!../../../../../../src/components/Common/Environments/Switch')
let Switch
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('Switch environment component', () => {
  let switchEnvironment = sandbox.stub().returns(Promise.resolve())

  const mockInjector = () => {
    Switch = SwitchInjector({
      '../../../vuex/modules/common/kuzzle/getters': {
        environments: sandbox.stub(),
        currentEnvironment: sandbox.stub()
      },
      '../../../services/environment': {
        switchEnvironment
      },
      './ModalCreate': mockedComponent
    })

    vm = new Vue({
      template: '<div><switch v-ref:switch></switch></div>',
      components: { Switch },
      replace: false,
      store
    }).$mount()

    $vm = vm.$refs.switch
    $vm.$dispatch = sandbox.stub()
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    describe('switchEnvironment', () => {
      it('should call switchEnvironment with right id', (done) => {
        $vm.switchEnvironment('toto')

        setTimeout(() => {
          expect(switchEnvironment.calledWith('toto')).to.be.equal(true)
          expect($vm.$dispatch.callCount).to.be.equal(0)
          done()
        }, 0)
      })

      it('should dispatch event for toaster on catch', (done) => {
        switchEnvironment = sandbox.stub().returns(Promise.reject(new Error('error')))
        mockInjector()

        $vm.switchEnvironment('toto')

        setTimeout(() => {
          expect(switchEnvironment.calledWith('toto')).to.be.equal(true)
          expect($vm.$dispatch.callCount).to.be.equal(1)
          done()
        }, 0)
      })
    })
  })
})
