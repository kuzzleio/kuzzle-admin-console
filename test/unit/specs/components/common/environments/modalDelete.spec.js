import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent, mockedDirective } from '../../../helper'

let ModalInjector = require('!!vue?inject!../../../../../../src/components/Common/Environments/ModalDelete')
let Modal
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('Modal Delete component', () => {
  let deleteEnvironment = sandbox.stub()
  let environmentId = 'default'
  let environments = sandbox.stub().returns({myEnv: {name: 'myEnvName'}})

  const mockInjector = () => {
    Modal = ModalInjector({
      '../../Materialize/Modal': mockedComponent,
      '../../../directives/focus.directive': mockedDirective('focus'),
      '../../../services/environment': {
        deleteEnvironment
      },
      '../../../vuex/modules/common/kuzzle/getters': {
        environments,
        currentEnvironmentId: sandbox.stub().returns('currentId')
      }
    })

    vm = new Vue({
      template: '<div><modal v-ref:modal :environment-id="environmentId"></modal></div>',
      components: { Modal },
      replace: false,
      data () {
        return {
          environmentId
        }
      },
      store
    }).$mount()

    $vm = vm.$refs.modal
    $vm.$broadcast = sandbox.stub()
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Watch', () => {
    describe('environmentId', () => {
      it('should do nothing if environmentId is null', (done) => {
        $vm.environmentId = null

        Vue.nextTick(() => {
          expect($vm.environmentName).to.be.equal(null)
          done()
        })
      })

      it('should do nothing if the environment id is not in the environments', (done) => {
        $vm.environmentId = 'wrongId'

        Vue.nextTick(() => {
          expect($vm.environmentName).to.be.equal(null)
          done()
        })
      })

      it('should inject the corresponding environment name in environmentName', (done) => {
        $vm.environmentId = 'myEnv'

        Vue.nextTick(() => {
          expect($vm.environmentName).to.be.equal('myEnvName')
          done()
        })
      })
    })
  })

  describe('Methods', () => {
    describe('confirmDeleteEnvironment', () => {
      it('should do nothing if the environment name confirmation is wrong', () => {
        $vm.environmentName = 'something'
        $vm.envConfirmation = 'other'

        $vm.confirmDeleteEnvironment()
        expect(deleteEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(0)
      })

      it('should call deleteEnvironment and broadcast event', () => {
        $vm.environmentId = 'myId'
        $vm.environmentName = 'same'
        $vm.envConfirmation = 'same'

        $vm.confirmDeleteEnvironment()
        expect(deleteEnvironment.calledWith('myId')).to.be.equal(true)
        expect($vm.$broadcast.calledWith('modal-close', 'delete-env')).to.be.equal(true)
      })

      it('should switch on the first environment if the user try to delete the current one', () => {
        $vm.environmentId = 'currentId'

        $vm.environmentName = 'same'
        $vm.envConfirmation = 'same'

        $vm.confirmDeleteEnvironment()
        expect(switchEnvironment.calledWith('myId')).to.be.equal(true)
        expect(deleteEnvironment.calledWith('myId')).to.be.equal(true)
        expect($vm.$broadcast.calledWith('modal-close', 'delete-env')).to.be.equal(true)
      })
    })
  })
})
