import store from '../../../../../../../src/vuex/store'
import Vue from 'vue'
import {mockedComponent} from '../../../../helper'

let JsonFormInjector = require('!!vue?inject!../../../../../../../src/components/Common/JsonForm/JsonFormItemArray/JsonFormItemArray')

describe('JsonFormItemArray tests', () => {
  let sandbox
  let JsonFormItemArray
  let vm
  let content
  let setPartialStub

  let initComponent = () => {
    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><json-form-item-array v-ref:jsonform :content="content" name="foo"></json-form-item-array></div>',
      components: {JsonFormItemArray},
      replace: false,
      store: store,
      data () {
        return {
          content: content
        }
      }
    }).$mount('body')
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    setPartialStub = sandbox.stub()
    JsonFormItemArray = JsonFormInjector({
      './JsonFormItemArrayInput': mockedComponent,
      '../../../../vuex/modules/data/actions': {
        setPartial: setPartialStub
      }
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('computed tests', () => {
    describe('itemType tests', () => {
      it('should return text type', (done) => {
        content = ['array']
        initComponent()
        Vue.nextTick(() => {
          expect(vm.$refs.jsonform.itemType).to.equals('text')
          done()
        })
      })

      it('should return number type', (done) => {
        content = [42]
        initComponent()
        Vue.nextTick(() => {
          expect(vm.$refs.jsonform.itemType).to.equals('number')
          done()
        })
      })

      it('should return text type', (done) => {
        content = []
        initComponent()
        Vue.nextTick(() => {
          expect(vm.$refs.jsonform.itemType).to.equals('text')
          done()
        })
      })
    })
  })

  describe('watch', () => {
    describe('valueItems', () => {
      it('should setPartial when changed', (done) => {
        content = []
        initComponent()
        Vue.nextTick(() => {
          expect(setPartialStub.called).to.be.ok
          done()
        })
      })
    })
  })

  describe('ready', () => {
    it('should set valueItems from content', () => {
      content = [1, 2, 3]
      initComponent()
      expect(vm.$refs.jsonform.valueItems).to.deep.equals([1, 2, 3])
    })
  })

  describe('events', () => {
    describe('json-form-item-array::remove-element', () => {
      it('should splice the array valueItems', () => {
        initComponent()
        vm.$refs.jsonform.valueItems = ['foo', 'myIndex', 'bar']
        vm.$refs.jsonform.$dispatch('json-form-item-array::remove-element', 'myIndex')
        expect(vm.$refs.jsonform.valueItems).to.deep.equals(['myIndex', 'bar'])
      })
    })

    describe('json-form-item-array::add-element', () => {
      it('should add an element to valueItems', () => {
        initComponent()
        vm.$refs.jsonform.valueItems = ['foo']
        vm.$refs.jsonform.$dispatch('json-form-item-array::add-element')
        expect(vm.$refs.jsonform.valueItems).to.deep.equals(['foo', null])
      })
    })
  })
})
