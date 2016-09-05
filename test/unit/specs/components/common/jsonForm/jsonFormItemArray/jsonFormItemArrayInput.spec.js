import store from '../../../../../../../src/vuex/store'
import Vue from 'vue'
import {mockedComponent} from '../../../../helper'

let JsonFormInjector = require('!!vue?inject!../../../../../../../src/components/Common/JsonForm/JsonFormItemArray/JsonFormItemArrayInput')

describe('JsonFormItemArrayInput tests', () => {
  let sandbox
  let JsonFormItemArrayInput
  let vm
  let valueItems = []
  let displayedLines = []

  let initComponent = () => {
    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><json-form-item-array-input v-ref:jsonform :value-items="valueItems" :displayed-lines="displayedLines" name="foo"></json-form-item-array-input></div>',
      components: {JsonFormItemArrayInput},
      replace: false,
      store: store,
      data () {
        return {
          valueItems,
          displayedLines
        }
      }
    }).$mount('body')
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    JsonFormItemArrayInput = JsonFormInjector({
      './InlineActions': mockedComponent
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('watch', () => {
    describe('valueItems', () => {
      it('should undisplay lines', (done) => {
        initComponent()
        vm.$refs.jsonform.valueItems = [1, 2, 3]
        Vue.nextTick(() => {
          expect(vm.$refs.jsonform.displayedLines).to.deep.equals([false, false, false])
          done()
        })
      })
    })
  })

  describe('ready', () => {
    it('should undisplay lines', (done) => {
      valueItems = [1, 2, 3]
      initComponent()
      expect(vm.$refs.jsonform.displayedLines).to.deep.equals([false, false, false])
      done()
    })
  })

  describe('methods', () => {
    describe('showRemoveElement', () => {
      it('should show a line', () => {
        initComponent()
        vm.$refs.jsonform.displayedLines = [1, 2, 3]
        vm.$refs.jsonform.showRemoveElement(1)
        expect(vm.$refs.jsonform.displayedLines).to.deep.equals([1, true, 3])
      })
    })

    describe('hideRemoveElement', () => {
      it('should hide a line', () => {
        initComponent()
        vm.$refs.jsonform.displayedLines = [1, 2, 3]
        vm.$refs.jsonform.hideRemoveElement(1)
        expect(vm.$refs.jsonform.displayedLines).to.deep.equals([1, false, 3])
      })
    })
  })
})
