import store from '../../../../../src/vuex/store'
import Vue from 'vue'

let JsonFormItemInjector = require('!!vue?inject!../../../../../src/components/Data/Documents/JsonFormItem')

describe('JsonFormItem tests', () => {
  let sandbox
  let JsonFormItem
  let vm
  let setPartialSpy

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    setPartialSpy = sandbox.stub()
    JsonFormItem = JsonFormItemInjector({
      '../../../vuex/modules/data/actions': {
        setPartial: setPartialSpy
      }
    })

    vm = new Vue({
      template: '<div><json-form-item v-ref:jsonformitem full-name="foo"></json-form-item></div>',
      components: {JsonFormItem},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.jsonformitem.value = 'bar'
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('updatePartial tests', () => {
      it('should call the vuex setPartial action', () => {
        vm.$refs.jsonformitem.updatePartial()
        expect(setPartialSpy.calledWith(store, 'foo', 'bar')).to.be.ok
      })
    })
  })
})
