import store from '../../../../../../src/vuex/store'
import Vue from 'vue'

let JsonFormItemInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonFormItem')

describe('JsonFormItem tests', () => {
  let sandbox
  let JsonFormItem
  let vm
  let setPartialSpy
  let content

  let initComponent = (ctx) => {
    vm = new Vue({
      template: '<div><json-form-item v-ref:jsonformitem :content="content" full-name="foo"></json-form-item></div>',
      components: {JsonFormItem},
      replace: false,
      store: store,
      data () {
        return {
          content
        }
      }
    }).$mount(ctx)
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('updatePartial tests', () => {
      beforeEach(() => {
        setPartialSpy = sandbox.stub()
        JsonFormItem = JsonFormItemInjector({
          '../../../vuex/modules/data/actions': {
            setPartial: setPartialSpy
          }
        })

        content = {val: 'bar'}
        initComponent()
      })

      it('should call the vuex setPartial action', (done) => {
        vm.content = {val: 'bar'}
        Vue.nextTick(() => {
          vm.$refs.jsonformitem.updatePartial()
          expect(setPartialSpy.calledWith(store, 'foo', 'bar')).to.be.ok
          done()
        })
      })
    })

    describe('setType', () => {
      it('should set the type to checkbox', () => {
        content = {type: 'boolean'}
        initComponent()

        vm.$refs.jsonformitem.setType()
        expect(vm.$refs.jsonformitem.type).to.equals('checkbox')
      })

      it('should set the type to number', () => {
        let types = ['integer', 'long', 'short', 'byte', 'double', 'float']

        types.forEach(o => {
          content = {type: o}
          initComponent()

          vm.$refs.jsonformitem.setType()
          expect(vm.$refs.jsonformitem.type).to.equals('number')
        })
      })

      it('should set the type to text', () => {
        content = {type: 'other'}
        initComponent()

        vm.$refs.jsonformitem.setType()
        expect(vm.$refs.jsonformitem.type).to.equals('text')
      })
    })
  })
})
