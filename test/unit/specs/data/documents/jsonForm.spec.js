import store from '../../../../../src/vuex/store'
import Vue from 'vue'
import {mockedComponent} from '../../helper'

let JsonFormInjector = require('!!vue?inject!../../../../../src/components/Data/Documents/JsonForm')

describe('JsonForm tests', () => {
  let sandbox
  let JsonForm
  let vm
  let content

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    content = {
      foo: {
        properties: {
          bar: {
            properties: {
              baz: 'one',
              booz: 'two'
            }
          }
        }
      },
      oof: 'con'
    }

    JsonForm = JsonFormInjector({
      './JsonFormItem': mockedComponent
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('computed tests', () => {
    describe('path tests', () => {
      beforeEach(() => {
        vm = new Vue({
          template: '<div><json-form v-ref:jsonform :content="content" name="foo"></json-form></div>',
          components: {JsonForm},
          replace: false,
          store: store,
          data () {
            return {
              content: content
            }
          }
        }).$mount()
      })

      it('should return the path of the object', (done) => {
        Vue.nextTick(() => {
          expect(vm.$refs.jsonform.path).to.equals('foo')
          done()
        })
      })
    })

    describe('concat path tests', () => {
      beforeEach(() => {
        vm = new Vue({
          template: '<div><json-form v-ref:jsonform :content="content.foo" :full-name-input="content.foo" name="bar"></json-form></div>',
          components: {JsonForm},
          replace: false,
          store: store,
          data () {
            return {
              content: content
            }
          }
        }).$mount()
      })

      it('should return the path of the sub object', (done) => {
        Vue.nextTick(() => {
          expect(vm.$refs.jsonform.path).to.equals('bar')
          done()
        })
      })
    })
  })
})
