import Vue from 'vue'
import { mockedComponent, mockedDirective } from '../../../helper'

let DocumentItemInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/DocumentItem')
let DocumentItem
let sandbox = sinon.sandbox.create()

describe('Document item', () => {
  let vm

  before(() => {
    DocumentItem = DocumentItemInjector({
      '../../Materialize/Dropdown': mockedComponent,
      '../../../directives/json-formatter.directive': mockedDirective
    })

    vm = new Vue({
      template: '<document-item v-ref:item :document="document"></document-item>',
      components: { DocumentItem },
      data () {
        return {
          document: {
            id: 'document-id'
          }
        }
      }
    }).$mount()

    sandbox.stub(vm.$refs.item, '$dispatch')
  })

  describe('Methods', () => {
    it('should toggle collapsed variable', () => {
      vm.$refs.item.toggleCollapse()
      expect(vm.$refs.item.collapsed).to.be.equal(false)

      vm.$refs.item.toggleCollapse()
      expect(vm.$refs.item.collapsed).to.be.equal(true)
    })

    it('should correctly emit event on notifyCheckboxClick', () => {
      vm.$refs.item.notifyCheckboxClick()

      expect(vm.$refs.item.$dispatch.calledWith('checkbox-click', 'document-id')).to.equal(true)
    })

    it('should correctly emit event on deleteDocument', () => {
      vm.$refs.item.deleteDocument()

      expect(vm.$refs.item.$dispatch.calledWith('delete-document', 'document-id')).to.equal(true)
    })
  })
})
