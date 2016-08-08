import Vue from 'vue'
import Promise from 'bluebird'
import store from '../../../../../src/vuex/store'
import ModalCreate from '../../../../../src/components/Data/Indexes/ModalCreate'

describe('ModalCreate tests', () => {
  describe('ModalCreate layout display', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><modal-create v-ref:modal id="createIndex"></modal-create></div>',
        components: { ModalCreate },
        replace: false,
        store: store
      }).$mount().$refs.modal

      vm.createIndex = sinon.stub(vm, 'createIndex').returns(Promise.resolve())
      vm.$broadcast = sinon.stub(vm, '$broadcast')
    })

    describe('tryCreateIndex', () => {
      it('should not call the createIndex method if index is empty', (done) => {
        vm.tryCreateIndex('')

        setTimeout(() => {
          expect(vm.createIndex.called, 'create index called').to.be.not.ok
          done()
        }, 0)
      })

      it('should call the createIndex method', (done) => {
        vm.tryCreateIndex('testIndex')

        setTimeout(() => {
          expect(vm.createIndex.calledWith('testIndex'), 'create index called').to.be.ok
          done()
        }, 0)
      })
      //
      // it('should call the reset fields if success', (done) => {
      //   let index = 'testIndex'
      //   vm.index = index
      //   vm.error = 'foo'
      //
      //   vm.tryCreateIndex(index)
      //
      //   setTimeout(() => {
      //     expect(vm.index, 'index emptyed').to.equal('')
      //     expect(vm.error, 'error emptyed').to.equal('')
      //     expect(vm.$broadcast.called, 'event modal-close broadcasted').to.be.ok
      //     done()
      //   }, 0)
      // })

      // it('should catch the message on error', (done) => {
      //   let index = 'testIndex'
      //   vm.createIndex = sinon.stub().returns(Promise.reject(new Error('message')))
      //   vm.tryCreateIndex(index)
      //
      //   setTimeout(() => {
      //     expect(vm.createIndex.called).to.be.ok
      //     expect(vm.createIndex.calledWith(index)).to.be.ok
      //     expect(vm.error).to.be.equal('message')
      //     done()
      //   }, 0)
      // })
    })
  })
})
