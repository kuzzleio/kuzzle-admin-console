import store from '../../../../../../../src/vuex/store'
import Vue from 'vue'

let JsonFormInjector = require('!!vue?inject!../../../../../../../src/components/Common/JsonForm/JsonFormItemArray/InlineActions')

describe('InlineActions tests', () => {
  let sandbox
  let InlineActions
  let vm
  let valueItems = []
  let $dispatch

  let initComponent = () => {
    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><inline-actions v-ref:jsonform :value-items="valueItems" full-name="foo.bar" name="foo"></inline-actions></div>',
      components: {InlineActions},
      replace: false,
      store: store,
      data () {
        return {
          valueItems
        }
      }
    }).$mount('body')
    $dispatch = sandbox.stub()
    vm.$refs.jsonform.$dispatch = $dispatch
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    InlineActions = JsonFormInjector({})
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods', () => {
    describe('addElementInArray', () => {
      it('should dispatch add-element mutation', () => {
        initComponent()
        vm.$refs.jsonform.addElementInArray()
        expect($dispatch.calledWith('json-form-item-array::add-element')).to.be.ok
      })
    })

    describe('removeElementInArray', () => {
      it('should dispatch change-type-attribute mutation', () => {
        initComponent()
        vm.$refs.jsonform.valueItems = ['foo']
        vm.$refs.jsonform.removeElementInArray()
        expect($dispatch.calledWith('document-create::change-type-attribute')).to.be.ok
      })

      it('should dispatch remove-element mutation', () => {
        initComponent()
        vm.$refs.jsonform.valueItems = []
        vm.$refs.jsonform.removeElementInArray()
        expect($dispatch.calledWith('json-form-item-array::remove-element')).to.be.ok
      })
    })
  })
})
