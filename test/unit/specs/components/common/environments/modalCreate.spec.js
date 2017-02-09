// import Vue from 'vue'
// import store from '../../../../../../src/vuex/store'
// import { mockedComponent, mockedDirective } from '../../../helper'
// import { DEFAULT_COLOR } from '../../../../../../src/services/environment'
//
// let ModalInjector = require('!!vue?inject!../../../../../../src/components/Common/Environments/ModalCreate')
// let Modal
// let sandbox = sinon.sandbox.create()
// let vm
// let $vm
//
// describe('Modal Create Environment component test', () => {
//   let listEnvironments = {
//     myEnv: {
//       name: 'myEnv',
//       host: 'myHost',
//       port: 8888,
//       color: DEFAULT_COLOR
//     }
//   }
//   let createEnvironment = sandbox.stub()
//   let updateEnvironment = sandbox.stub()
//   let environments = sandbox.stub().returns(listEnvironments)
//
//   const mockInjector = () => {
//     Modal = ModalInjector({
//       '../../Materialize/Modal': mockedComponent,
//       '../../../directives/focus.directive': mockedDirective('focus'),
//       '../../../services/environment': {
//         createEnvironment,
//         updateEnvironment,
//         DEFAULT_COLOR: DEFAULT_COLOR
//       },
//       '../../../vuex/modules/common/kuzzle/getters': {
//         environments
//       }
//     })
//
//     vm = new Vue({
//       template: '<div><modal v-ref:modal></modal></div>',
//       components: { Modal },
//       replace: false,
//       store
//     }).$mount()
//
//     $vm = vm.$refs.modal
//     $vm.$broadcast = sandbox.stub()
//   }
//
//   before(() => mockInjector())
//   afterEach(() => sandbox.restore())
//
//   describe('Watch', () => {
//     describe('environmentId', () => {
//       it('should reset environment if environmentId is null or not in environments', (done) => {
//         $vm.environmentId = null
//
//         Vue.nextTick(() => {
//           expect($vm.environment.name).to.be.equal(null)
//           expect($vm.environment.host).to.be.equal(null)
//           expect($vm.environment.port).to.be.equal(7512)
//           expect($vm.environment.color).to.be.equal(DEFAULT_COLOR)
//           done()
//         })
//       })
//
//       it('should set values from environment if environmentId is defined', (done) => {
//         $vm.environmentId = 'myEnv'
//
//         Vue.nextTick(() => {
//           expect($vm.environment).to.be.deep.equal(listEnvironments['myEnv'])
//           done()
//         })
//       })
//     })
//   })
//
//   describe('Methods', () => {
//     describe('createEnvironments', () => {
//       it('should set error and do nothing on name error', () => {
//         $vm.environment.name = null
//         $vm.environment.port = 7512
//         $vm.environment.host = 'localhost'
//
//         updateEnvironment.reset()
//         createEnvironment.reset()
//         $vm.$broadcast.reset()
//
//         $vm.createEnvironments()
//         expect($vm.errors.name).to.be.equal(true)
//         expect(updateEnvironment.callCount).to.be.equal(0)
//         expect(createEnvironment.callCount).to.be.equal(0)
//         expect($vm.$broadcast.callCount).to.be.equal(0)
//       })
//
//       it('should set error and do nothing on host error', () => {
//         $vm.environment.name = 'localhost'
//         $vm.environment.port = 7512
//         $vm.environment.host = 'http://toto'
//
//         updateEnvironment.reset()
//         createEnvironment.reset()
//         $vm.$broadcast.reset()
//
//         $vm.createEnvironments()
//         expect($vm.errors.host).to.be.equal(true)
//         expect(updateEnvironment.callCount).to.be.equal(0)
//         expect(createEnvironment.callCount).to.be.equal(0)
//         expect($vm.$broadcast.callCount).to.be.equal(0)
//
//         $vm.environment.host = 'ws://tutu'
//
//         updateEnvironment.reset()
//         createEnvironment.reset()
//         $vm.$broadcast.reset()
//
//         $vm.createEnvironments()
//         expect($vm.errors.host).to.be.equal(true)
//         expect(updateEnvironment.callCount).to.be.equal(0)
//         expect(createEnvironment.callCount).to.be.equal(0)
//         expect($vm.$broadcast.callCount).to.be.equal(0)
//       })
//
//
//       it('should set error and do nothing on port error', () => {
//         $vm.environment.name = 'localhost'
//         $vm.environment.port = -7512
//         $vm.environment.host = 'localhost'
//
//         updateEnvironment.reset()
//         createEnvironment.reset()
//         $vm.$broadcast.reset()
//
//         $vm.createEnvironments()
//         expect($vm.errors.port).to.be.equal(true)
//         expect(updateEnvironment.callCount).to.be.equal(0)
//         expect(createEnvironment.callCount).to.be.equal(0)
//         expect($vm.$broadcast.callCount).to.be.equal(0)
//       })
//
//       it('should update environment and close modal', () => {
//         $vm.environment.name = 'localhost'
//         $vm.environment.port = 7512
//         $vm.environment.host = 'localhost'
//
//         $vm.environmentId = 10
//
//         updateEnvironment.reset()
//         createEnvironment.reset()
//         $vm.$broadcast.reset()
//
//         $vm.createEnvironments()
//         expect(updateEnvironment.callCount).to.be.equal(1)
//         expect(createEnvironment.callCount).to.be.equal(0)
//         expect($vm.$broadcast.callCount).to.be.equal(1)
//       })
//
//       it('should create environment and close modal', () => {
//         $vm.environment.name = 'localhost'
//         $vm.environment.port = 7512
//         $vm.environment.host = 'localhost'
//
//         $vm.environmentId = null
//
//         updateEnvironment.reset()
//         createEnvironment.reset()
//         $vm.$broadcast.reset()
//
//         $vm.createEnvironments()
//         expect(updateEnvironment.callCount).to.be.equal(0)
//         expect(createEnvironment.callCount).to.be.equal(1)
//         expect($vm.$broadcast.callCount).to.be.equal(1)
//       })
//     })
//
//     describe('selectColor', () => {
//       it('should affect the corresponding color to environment.color', () => {
//         $vm.colors = ['#dc2222', '#7f6500', '#ccaa2a']
//         $vm.selectColor(2)
//
//         expect($vm.environment.color).to.be.equal($vm.colors[2])
//       })
//     })
//   })
// })
