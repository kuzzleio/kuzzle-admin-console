import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import { mockedComponent } from '../../helper'

let ListInjector = require('!!vue?inject!../../../../../src/components/Security/Users/List')

describe('Users list', () => {
  let List
  let vm

  beforeEach(() => {
    List = ListInjector({
      './UserItem': mockedComponent,
      '../../Common/CrudlDocument': mockedComponent
    })

    vm = new Vue({
      template: '<div><list v-ref:list></list></div>',
      components: {
        List
      },
      store: store
    }).$mount()
  })

  describe('Computed', () => {
    describe('displayBulkDelete', () => {
      it('should returns false if selectedDocuments is empty', (done) => {
        vm.$refs.list.selectedDocuments = []

        Vue.nextTick(() => {
          expect(vm.$refs.list.displayBulkDelete).to.be.equal(false)
          done()
        })
      })

      it('should returns true if selectedDocuments is not empty', (done) => {
        vm.$refs.list.selectedDocuments = ['doc1']

        Vue.nextTick(() => {
          expect(vm.$refs.list.displayBulkDelete).to.be.equal(true)
          done()
        })
      })
    })

    describe('allChecked', () => {
      beforeEach(() => {
        List = ListInjector({
          '../../../vuex/modules/common/crudlDocument/getters': {
            documents: sinon.stub().returns([{id: 'doc1'}, {id: 'doc2'}])
          },
          './UserItem': mockedComponent,
          '../../Common/CrudlDocument': mockedComponent
        })

        vm = new Vue({
          template: '<div><list v-ref:list></list></div>',
          components: {
            List
          },
          store: store
        }).$mount()
      })

      it('should return false if there is not the same documents number in list and in selectedDocuments', () => {
        vm.$refs.list.selectedDocuments = ['doc1']
        expect(vm.$refs.list.allChecked).to.be.equal(false)
      })

      it('should return true if there is the same documents number in list and in selectedDocuments', () => {
        vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
        expect(vm.$refs.list.allChecked).to.be.equal(true)
      })
    })

    describe('Method', () => {
      describe('isChecked', () => {
        it('should return true only if the document is selected', () => {
          vm.$refs.list.selectedDocuments = ['doc1']
          expect(vm.$refs.list.isChecked('doc1')).to.be.equal(true)

          vm.$refs.list.selectedDocuments = ['doc2']
          expect(vm.$refs.list.isChecked('doc1')).to.be.equal(false)
        })
      })

      describe('toggleAll', () => {
        it('should empty selected documents if all documents are already selected', () => {
          List = ListInjector({
            '../../../vuex/modules/common/crudlDocument/getters': {
              documents: sinon.stub().returns([{id: 'doc1'}, {id: 'doc2'}])
            },
            './UserItem': mockedComponent,
            '../../Common/CrudlDocument': mockedComponent
          })

          vm = new Vue({
            template: '<div><list v-ref:list></list></div>',
            components: {
              List
            },
            store: store
          }).$mount()

          vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
          vm.$refs.list.toggleAll()

          expect(vm.$refs.list.selectedDocuments).to.be.deep.equal([])
        })

        it('should add all documents in selected documents', () => {
          List = ListInjector({
            '../../../vuex/modules/common/crudlDocument/getters': {
              documents: sinon.stub().returns([{id: 'doc1'}, {id: 'doc2'}, {id: 'doc3'}])
            },
            './UserItem': mockedComponent,
            '../../Common/CrudlDocument': mockedComponent
          })

          vm = new Vue({
            template: '<div><list v-ref:list></list></div>',
            components: {
              List
            },
            store: store
          }).$mount()

          vm.$refs.list.selectedDocuments = ['doc1']
          vm.$refs.list.toggleAll()

          expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc1', 'doc2', 'doc3'])
        })
      })

      describe('toggleSelectDocuments', () => {
        it('should add the document in list', () => {
          vm.$refs.list.selectedDocuments = ['doc1']
          vm.$refs.list.toggleSelectDocuments('doc2')
          expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc1', 'doc2'])

          vm.$refs.list.toggleSelectDocuments('doc1')
          expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc2'])
        })

        it('should remove document from list if it\'s already there', () => {
          vm.$refs.list.selectedDocuments = ['doc1', 'doc2']
          vm.$refs.list.toggleSelectDocuments('doc1')

          expect(vm.$refs.list.selectedDocuments).to.be.deep.equal(['doc2'])
        })
      })
    })
  })
})
