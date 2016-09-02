import store from '../../../../../../src/vuex/store'
import Vue from 'vue'

let JsonFormItemCheckboxInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonFormItemCheckbox')

describe('JsonFormItemCheckbox tests', () => {
  let sandbox = sinon.sandbox.create()
  let JsonFormItemCheckbox
  let vm
  let setPartialSpy = sandbox.stub()
  let fullName
  let content

  let initComponent = () => {
    JsonFormItemCheckbox = JsonFormItemCheckboxInjector({
      '../../../vuex/modules/data/actions': {
        setPartial: setPartialSpy
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><json-form-item-checkbox v-ref:jsonformitem :content="true" full-name="foo.bar" name="myName"></json-form-item-checkbox></div>',
      components: {JsonFormItemCheckbox},
      replace: false,
      store: store,
      data () {
        return {
          fullName,
          content
        }
      }
    }).$mount('body')
    vm.$refs.jsonformitem.setPartial = setPartialSpy
  }

  afterEach(() => {
    sandbox.restore()
  })

  describe('watch', () => {
    describe('value', () => {
      it('should trigger mutation setPartial', () => {
        initComponent()
        vm.$refs.jsonformitem.value = 'foo'
        Vue.nextTick(() => {
          expect(setPartialSpy.called).to.be.ok
        })
      })
    })
  })
})
