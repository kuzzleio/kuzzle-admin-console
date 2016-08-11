import Vue from 'vue'
import Promise from 'bluebird'
import { mockedComponent } from '../../helper'
import store from '../../../../../src/vuex/store'

let ModalCreateInjector = require('!!vue?inject!../../../../../src/components/Data/Indexes/ModalCreate')

describe('ModalCreate tests', () => {
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
      }).$mount()
    })

    it('should call the createIndex method', (done) => {
      let index = 'testIndex'
      vm.$refs.modal.createIndex = sinon.stub().returns(Promise.resolve())
      vm.$refs.modal.index = 'fooo'
      vm.$refs.modal.$broadcast = sinon.spy()
      vm.$refs.modal.tryCreateIndex(index)

      setTimeout(() => {
        expect(vm.$refs.modal.createIndex.called).to.be.ok
        expect(vm.$refs.modal.createIndex.calledWith(index)).to.be.ok
        expect(vm.$refs.modal.index).to.be.equal('')
        expect(vm.$refs.modal.error).to.be.equal('')
        expect(vm.$refs.modal.$broadcast.called).to.be.ok
        expect(vm.$refs.modal.$broadcast.calledWith('modal-close', vm.$refs.modal.id)).to.be.ok
        done()
      }, 0)
    })

    it('should catch the message on error', (done) => {
      let index = 'testIndex'
      vm.$refs.modal.createIndex = sinon.stub().returns(Promise.reject(new Error('message')))
      vm.$refs.modal.tryCreateIndex(index)

      setTimeout(() => {
        expect(vm.$refs.modal.createIndex.called).to.be.ok
        expect(vm.$refs.modal.createIndex.calledWith(index)).to.be.ok
        expect(vm.$refs.modal.error).to.be.equal('message')
        done()
      }, 0)
    })
  })
})
