import store from '../../../../../../src/vuex/store'
import Vue from 'vue'
import lolex from 'lolex'

let JsonFormItemTextInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonFormItemText')

describe('JsonFormItemText tests', () => {
  let sandbox = sinon.sandbox.create()
  let JsonFormItemText
  let vm
  let setPartialSpy = sandbox.stub()
  let value
  let content
  let $dispatch = sandbox.stub()

  let initComponent = () => {
    JsonFormItemText = JsonFormItemTextInjector({
      '../../../vuex/modules/data/actions': {
        setPartial: setPartialSpy
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><json-form-item-text v-ref:jsonformitem :content="content" full-name="foo.bar" name="myName"></json-form-item-text></div>',
      components: {JsonFormItemText},
      replace: false,
      store: store,
      data () {
        return {
          value,
          content
        }
      }
    }).$mount('body')
    vm.$refs.jsonformitem.setPartial = setPartialSpy
    vm.$refs.jsonformitem.$dispatch = $dispatch
  }

  afterEach(() => {
    sandbox.restore()
  })

  describe('watch', () => {
    describe('value', () => {
      it('should trigger mutation setPartial', () => {
        initComponent()
        vm.$refs.jsonformitem.value = 'foo'
        vm.$refs.jsonformitem.transformToArray()
        Vue.nextTick(() => {
          expect(setPartialSpy.called).to.be.ok
        })
      })
    })
  })

  describe('methods tests', () => {
    describe('hideAttribute', () => {
      it('should undisplay after 100ms', () => {
        let clock = lolex.install()
        initComponent()
        expect(vm.$refs.jsonformitem.display).to.equals(false)
        vm.$refs.jsonformitem.display = true
        vm.$refs.jsonformitem.hideAttribute()
        clock.tick(100)
        clock.uninstall()
        expect(vm.$refs.jsonformitem.display).to.equals(false)
      })
    })

    describe('transformToArray', () => {
      it('should dispatch change-type-attribute with null value', () => {
        initComponent()
        vm.$refs.jsonformitem.transformToArray()
        expect($dispatch.calledWith('document-create::change-type-attribute', 'foo', 'myName', 'array', [null])).to.be.ok
      })

      it('should dispatch change-type-attribute with non null value', () => {
        initComponent()
        vm.$refs.jsonformitem.value = 'myValue'
        vm.$refs.jsonformitem.transformToArray()
        expect($dispatch.calledWith('document-create::change-type-attribute', 'foo', 'myName', 'array', ['myValue', null])).to.be.ok
      })
    })
  })
})
