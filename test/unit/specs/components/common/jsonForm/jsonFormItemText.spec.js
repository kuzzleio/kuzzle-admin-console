import store from '../../../../../../src/vuex/store'
import Vue from 'vue'

let JsonFormItemInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonFormItemText')

describe('JsonFormItemText tests', () => {
  let sandbox
  let JsonFormItemText
  let vm
  let setPartialSpy
  let content

  let initComponent = (ctx) => {
    if (ctx) {
      document.body.insertAdjacentHTML('afterbegin', '<' + ctx + '></' + ctx + '>')
    }
    vm = new Vue({
      template: '<div><json-form-item-text v-ref:jsonformitem :content="content" full-name="foo"></json-form-item-text></div>',
      components: {JsonFormItemText},
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
        JsonFormItemText = JsonFormItemInjector({
          '../../../vuex/modules/data/actions': {
            setPartial: setPartialSpy
          }
        })

        content = 'bar'
        initComponent('body')
      })

      it('should call the vuex setPartial action', (done) => {
        vm.value = 'bar'
        Vue.nextTick(() => {
          expect(setPartialSpy.calledWith(store, 'foo', 'bar')).to.be.ok
          done()
        })
      })
    })

    // describe('setType', () => {
    //   it('should set the type to checkbox', () => {
    //     content = {type: 'boolean'}
    //     initComponent()
    //
    //     vm.$refs.jsonformitem.setType()
    //     expect(vm.$refs.jsonformitem.type).to.equals('checkbox')
    //   })
    //
    //   it('should set the type to number', () => {
    //     let types = ['integer', 'long', 'short', 'byte', 'double', 'float']
    //
    //     types.forEach(o => {
    //       content = {type: o}
    //       initComponent()
    //
    //       vm.$refs.jsonformitem.setType()
    //       expect(vm.$refs.jsonformitem.type).to.equals('number')
    //     })
    //   })
    //
    //   it('should set the type to text', () => {
    //     content = {type: 'other'}
    //     initComponent()
    //
    //     vm.$refs.jsonformitem.setType()
    //     expect(vm.$refs.jsonformitem.type).to.equals('text')
    //   })
    // })
  })
})
