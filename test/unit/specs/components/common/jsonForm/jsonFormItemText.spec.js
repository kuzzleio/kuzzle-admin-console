import store from '../../../../../../src/vuex/store'
import Vue from 'vue'

let JsonFormItemTextInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonFormItemText')

describe('JsonFormItemText tests', () => {
  let sandbox = sinon.sandbox.create()
  let JsonFormItemText
  let vm
  let setPartialSpy = sandbox.stub()
  let value
  let content

  let initComponent = () => {
    JsonFormItemText = JsonFormItemTextInjector({
      '../../../vuex/modules/data/actions': {
        setPartial: setPartialSpy
      }
    })

    vm = new Vue({
      template: '<div><json-form-item-text v-ref:jsonformitem :content="content" full-name="foo"></json-form-item-text></div>',
      components: {JsonFormItemText},
      replace: false,
      store: store,
      data () {
        return {
          value,
          content
        }
      }
    }).$mount()
  }

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('updatePartial tests', () => {
      it('should call the vuex setPartial action when the content changed', (done) => {
        initComponent('body')
        vm.$refs.jsonformitem.content = 'bar'
        Vue.nextTick(() => {
          expect(setPartialSpy.calledWith(store, 'foo', 'bar')).to.be.ok
          done()
        })
      })
    })
  })
})
