import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent, mockedDirective } from '../../../helper'

let ModalInjector = require('!!vue?inject!../../../../../../src/components/Common/Environments/ModalCreate')
let Modal
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('Modal Create Environment component test', () => {
  let createEnvironment = sandbox.stub()
  let updateEnvironment = sandbox.stub()
  let environments = sandbox.stub()
  const DEFAULT_COLOR = 'default-color'

  const mockInjector = () => {
    Modal = ModalInjector({
      '../../Materialize/Modal': mockedComponent,
      '../../../directives/focus.directive': mockedDirective('focus'),
      '../../../services/environment': {
        createEnvironment,
        updateEnvironment,
        DEFAULT_COLOR
      },
      '../../../vuex/modules/common/kuzzle/getters': {
        environments
      }
    })

    vm = new Vue({
      template: '<div><modal v-ref:modal></modal></div>',
      components: { Modal },
      replace: false,
      store
    }).$mount()

    $vm = vm.$refs.modal
    $vm.$broadcast = sandbox.stub()
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Watch', () => {
  })

  describe('Methods', () => {
    describe('createEnvironments', () => {
      it('should set error and do nothing on name error', () => {
        $vm.environment.name = null
        $vm.environment.wsPort = 7513
        $vm.environment.ioPort = 7512
        $vm.environment.host = 'localhost'

        $vm.createEnvironments()
        expect($vm.errors.name).to.be.equal(true)
        expect(updateEnvironment.callCount).to.be.equal(0)
        expect(createEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(0)
      })

      it('should set error and do nothing on host error', () => {
        $vm.environment.name = 'localhost'
        $vm.environment.wsPort = 7513
        $vm.environment.ioPort = 7512
        $vm.environment.host = 'http://toto'

        $vm.createEnvironments()
        expect($vm.errors.host).to.be.equal(true)
        expect(updateEnvironment.callCount).to.be.equal(0)
        expect(createEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(0)

        $vm.environment.host = 'ws://tutu'

        $vm.createEnvironments()
        expect($vm.errors.host).to.be.equal(true)
        expect(updateEnvironment.callCount).to.be.equal(0)
        expect(createEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(0)
      })

      it('should set error and do nothing on wsPort error', () => {
        $vm.environment.name = 'localhost'
        $vm.environment.wsPort = -7513
        $vm.environment.ioPort = 7512
        $vm.environment.host = 'localhost'

        $vm.createEnvironments()
        expect($vm.errors.wsPort).to.be.equal(true)
        expect(updateEnvironment.callCount).to.be.equal(0)
        expect(createEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(0)
      })

      it('should set error and do nothing on ioPort error', () => {
        $vm.environment.name = 'localhost'
        $vm.environment.wsPort = 7513
        $vm.environment.ioPort = -7512
        $vm.environment.host = 'localhost'

        $vm.createEnvironments()
        expect($vm.errors.ioPort).to.be.equal(true)
        expect(updateEnvironment.callCount).to.be.equal(0)
        expect(createEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(0)
      })

      it('should update environment and close modal', () => {
        $vm.environment.name = 'localhost'
        $vm.environment.wsPort = 7513
        $vm.environment.ioPort = 7512
        $vm.environment.host = 'localhost'

        $vm.environmentId = 10

        $vm.createEnvironments()
        expect(updateEnvironment.callCount).to.be.equal(1)
        expect(createEnvironment.callCount).to.be.equal(0)
        expect($vm.$broadcast.callCount).to.be.equal(1)
      })

      it('should create environment and close modal', () => {
        $vm.environment.name = 'localhost'
        $vm.environment.wsPort = 7513
        $vm.environment.ioPort = 7512
        $vm.environment.host = 'localhost'

        $vm.environmentId = null

        $vm.createEnvironments()
        expect(updateEnvironment.callCount).to.be.equal(0)
        expect(createEnvironment.callCount).to.be.equal(1)
        expect($vm.$broadcast.callCount).to.be.equal(1)
      })
    })
  })
})
