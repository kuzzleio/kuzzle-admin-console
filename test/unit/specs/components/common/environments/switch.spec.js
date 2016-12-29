// import Vue from 'vue'
// import store from '../../../../../../src/vuex/store'
// import { mockedComponent } from '../../../helper'
// import { DEFAULT_COLOR } from '../../../../../../src/services/environment'
// let SwitchInjector = require('!!vue?inject!../../../../../../src/components/Common/Environments/Switch')
// let Switch
// let sandbox = sinon.sandbox.create()
// let vm
// let $vm
//
// describe('Switch environment component', () => {
//   const BGCOLOR = '#FFF'
//   let switchEnvironment = sandbox.stub().returns(Promise.resolve())
//   let currentEnvironment = sandbox.stub().returns({})
//   let tinyColorStub = sandbox.stub().returns({
//     lighten () {
//       return {
//         toString () {
//           return BGCOLOR
//         }
//       }
//     }
//   })
//   const mockInjector = () => {
//     Switch = SwitchInjector({
//       '../../../vuex/modules/common/kuzzle/getters': {
//         environments: sandbox.stub(),
//         currentEnvironment
//       },
//       '../../../services/environment': {
//         switchEnvironment,
//         DEFAULT_COLOR
//       },
//       './ModalCreate': mockedComponent,
//       'tinycolor2/tinycolor': tinyColorStub
//     })
//
//     vm = new Vue({
//       template: '<div><switch v-ref:switch></switch></div>',
//       components: { Switch },
//       replace: false,
//       store
//     }).$mount()
//
//     $vm = vm.$refs.switch
//     $vm.$dispatch = sandbox.stub()
//     $vm.$router = {go: sandbox.stub()}
//   }
//
//   before(() => mockInjector())
//   afterEach(() => sandbox.restore())
//
//   describe('Methods', () => {
//     describe('switchEnvironment', () => {
//       it('should call switchEnvironment with right id', (done) => {
//         $vm.switchEnvironment('toto')
//           .then(() => {
//             expect(switchEnvironment.calledWith('toto')).to.be.equal(true)
//             expect($vm.$dispatch.callCount).to.be.equal(0)
//             done()
//           })
//           .catch((e) => done(e))
//       })
//
//       it('should dispatch event for toaster on catch', (done) => {
//         switchEnvironment = sandbox.stub().returns(Promise.reject(new Error('error')))
//         mockInjector()
//
//         $vm.switchEnvironment('toto')
//           .then(() => {
//             done(new Error('should not resolve'))
//           })
//           .catch(() => {
//             expect(switchEnvironment.calledWith('toto')).to.be.equal(true)
//             expect($vm.$dispatch.callCount).to.be.equal(1)
//             done()
//           })
//       })
//     })
//   })
//
//   describe('Computed', () => {
//     describe('currentEnvironmentName', () => {
//       it('should return null if the current environment is undefined', () => {
//         currentEnvironment = sandbox.stub().returns(null)
//         mockInjector()
//
//         expect($vm.currentEnvironmentName).to.be.equal(null)
//       })
//
//       it('should return the current environment color', () => {
//         currentEnvironment = sandbox.stub().returns({name: 'toto'})
//         mockInjector()
//
//         expect($vm.currentEnvironmentName).to.be.equal('toto')
//       })
//     })
//
//     describe('bgColor', () => {
//       it('should return default color if blendColor is falsy', () => {
//         $vm.blendColor = false
//         expect($vm.bgColor).to.equals(DEFAULT_COLOR)
//       })
//
//       it('should return a light color if blendColor is truthy', () => {
//         $vm.blendColor = true
//         expect($vm.bgColor).to.equals(BGCOLOR)
//       })
//
//       it('should return a light color if blendColor is truthy and currentEnvironment is falsy', () => {
//         currentEnvironment = sandbox.stub().returns(null)
//         mockInjector()
//         $vm.blendColor = true
//         expect($vm.bgColor).to.equals(BGCOLOR)
//         currentEnvironment = sandbox.stub().returns({})
//       })
//     })
//   })
// })
