import Vue from 'vue'
import { mockedComponent, mockedDirective } from '../../../helper'
import VueRouter from 'vue-router'
import util from 'util'

let DocumentItemInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/DocumentItem')
let DocumentItem
let sandbox = sinon.sandbox.create()

describe.only('Document item', () => {
  let component
  let router
  let vm

  beforeEach(() => {
    DocumentItem = DocumentItemInjector({
      '../../Materialize/Dropdown': mockedComponent,
      '../../../directives/json-formatter.directive': mockedDirective
    })

    Vue.use(VueRouter)
    const App = Vue.extend({
      template: '<div><router-view v-ref:routerview></router-view></div>',
      replace: false
    })

    component = new Vue({
      template: '<document-item v-ref:item :document="document"></document-item>',
      components: { DocumentItem },
      data () {
        return {
          document: {
            id: 'document-id'
          }
        }
      }
    })

    router = new VueRouter({ abstract: true })
    router.map({
      '/': {
        name: 'DataCreateDocument',
        component: component
      },
      '/:index/:collection/Update/:id': {
        name: 'DataDocumentDetail',
        component: mockedComponent
      }
    })

    router.start(App, 'body')
    router.go({name: 'DataCreateDocument'})

    vm = router.app.$refs.routerview

    console.log(util.inspect(vm.$refs, {showHidden: false, depth: null}))
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
