import Vue from 'vue'
import Promise from 'bluebird'
import { mockedComponent } from '../../../helper'
import store from '../../../../../../src/vuex/store'

let ModalDeleteInjector = require('!!vue?inject!../../../../../../src/components/Data/Indexes/ModalDelete')

let sandbox = sinon.sandbox.create()

describe('ModalDelete tests', () => {
  let ModalDelete = ModalDeleteInjector({
    '../../Materialize/Modal': mockedComponent
  })

  describe('ModalDelete layout display', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><modal-delete v-ref:modal id="deleteIndex"></modal-delete></div>',
        components: { ModalDelete },
        replace: false,
        store: store
      }).$mount().$refs.modal
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('tryDeleteIndex', () => {
      it('should not call the deleteIndex method if index is empty', (done) => {
        sandbox.stub(vm, 'deleteIndex').returns(Promise.resolve())

        vm.tryDeleteIndex('')

        setTimeout(() => {
          expect(vm.deleteIndex.called, 'delete index called').to.be.not.ok
          done()
        }, 0)
      })

      it('should call the createIndex method', (done) => {
        vm.deleteIndex = sandbox.stub(vm, 'deleteIndex').returns(Promise.resolve())

        vm.tryDeleteIndex('testIndex')

        setTimeout(() => {
          expect(vm.deleteIndex.calledWith('testIndex'), 'delete index called').to.be.ok
          done()
        }, 0)
      })

      it('should call the reset fields if success', (done) => {
        let index = 'testIndex'
        vm.indexConfirmation = index
        vm.error = 'foo'
        vm.deleteIndex = sandbox.stub(vm, 'deleteIndex').returns(Promise.resolve())
        vm.$broadcast = sandbox.stub(vm, '$broadcast')

        vm.tryDeleteIndex(index)

        setTimeout(() => {
          expect(vm.indexConfirmation, 'index emptyed').to.equal('')
          expect(vm.error, 'error emptyed').to.equal('')
          expect(vm.$broadcast.called, 'event modal-close broadcasted').to.be.ok
          done()
        }, 0)
      })

      it('should catch the message on error', (done) => {
        let index = 'testIndex'
        vm.deleteIndex = sandbox.stub(vm, 'deleteIndex').returns(Promise.reject(new Error('message')))
        vm.$broadcast = sandbox.stub(vm, '$broadcast')

        vm.tryDeleteIndex(index)

        setTimeout(() => {
          expect(vm.deleteIndex.called).to.be.ok
          expect(vm.deleteIndex.calledWith(index)).to.be.ok
          expect(vm.error).to.be.equal('message')
          done()
        }, 0)
      })
    })
  })
})
