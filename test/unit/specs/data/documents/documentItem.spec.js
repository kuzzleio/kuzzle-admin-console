import store from '../../../../../src/vuex/store'
import Vue from 'vue'

let DocumentItemInjector = require('inject!../../../../../src/components/Data/Documents/DocumentItem')

describe('DocumentItem tests', () => {
  let sandbox
  let DocumentItem
  let vm
  let dispatch

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    dispatch = sandbox.spy()
    DocumentItem = DocumentItemInjector({
      '../../../directives/json-formatter.directive': sandbox.stub(),
      '../../Materialize/Dropdown': sandbox.stub()
    })

    vm = new Vue({
      template: '<div><document-item v-ref:document :document="{id: \'id\'}"></document-item></div>',
      components: {DocumentItem},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.document.$dispatch = dispatch
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('toggleCollapse tests', () => {
      it('should toggle the collapsing component', () => {
        expect(vm.$refs.document.collapsed).to.equals(true)
        vm.$refs.document.toggleCollapse()
        expect(vm.$refs.document.collapsed).to.equals(false)
      })
    })

    describe('notifyCheckboxClick tests', () => {
      it('should dispatch an event with document id', () => {
        vm.$refs.document.notifyCheckboxClick()
        expect(dispatch).to.be.calledWith('checkbox-click', 'id')
      })
    })

    describe('deleteDocument tests', () => {
      it('should dispatch an event with document id', () => {
        vm.$refs.document.deleteDocument()
        expect(dispatch).to.be.calledWith('delete-document', 'id')
      })
    })
  })
})
