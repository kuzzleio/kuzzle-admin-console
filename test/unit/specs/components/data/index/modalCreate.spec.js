import Vue from 'vue'
import Promise from 'bluebird'
import { mockedComponent } from '../../../helper'
import store from '../../../../../../src/vuex/store'

let ModalCreateInjector = require('!!vue?inject!../../../../../../src/components/Data/Indexes/ModalCreate')

let sandbox = sinon.sandbox.create()

describe.only('ModalCreate tests', () => {
  let ModalCreate = ModalCreateInjector({
    '../../Materialize/Modal': mockedComponent
  })

  describe('ModalCreate layout display', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><modal-create v-ref:modal id="createIndex"></modal-create></div>',
        components: { ModalCreate },
        replace: false,
        store: store
      }).$mount().$refs.modal
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('tryCreateIndex', () => {
      it('should not call the createIndex method if index is empty', (done) => {
        sandbox.stub(vm, 'createIndex').returns(Promise.resolve())

        vm.tryCreateIndex('')

        setTimeout(() => {
          expect(vm.createIndex.called, 'create index called').to.be.not.ok
          done()
        }, 0)
      })

      it('should call the createIndex method', (done) => {
        vm.createIndex = sandbox.stub(vm, 'createIndex').returns(Promise.resolve())

        vm.tryCreateIndex('testIndex')

        setTimeout(() => {
          expect(vm.createIndex.calledWith('testIndex'), 'create index called').to.be.ok
          done()
        }, 0)
      })

      it('should call the reset fields if success', (done) => {
        let index = 'testIndex'
        vm.index = index
        vm.error = 'foo'
        vm.createIndex = sandbox.stub(vm, 'createIndex').returns(Promise.resolve())
        vm.$broadcast = sandbox.stub(vm, '$broadcast')

        vm.tryCreateIndex(index)

        setTimeout(() => {
          expect(vm.index, 'index emptyed').to.equal('')
          expect(vm.error, 'error emptyed').to.equal('')
          expect(vm.$broadcast.called, 'event modal-close broadcasted').to.be.ok
          done()
        }, 0)
      })

      it('should catch the message on error', (done) => {
        let index = 'testIndex'
        vm.createIndex = sandbox.stub(vm, 'createIndex').returns(Promise.reject(new Error('message')))
        vm.$broadcast = sandbox.stub(vm, '$broadcast')

        vm.tryCreateIndex(index)

        setTimeout(() => {
          expect(vm.createIndex.called).to.be.ok
          expect(vm.createIndex.calledWith(index)).to.be.ok
          expect(vm.error).to.be.equal('message')
          done()
        }, 0)
      })
    })
  })
})
