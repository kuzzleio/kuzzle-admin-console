import store from '../../../../../../src/vuex/store'
import Vue from 'vue'
import {mockedComponent} from '../../../helper'

let JsonFormInjector = require('!!vue?inject!../../../../../../src/components/Common/JsonForm/JsonForm')

describe('JsonForm tests', () => {
  let sandbox
  let JsonForm
  let vm
  let content

  let initComponent = () => {
    vm = new Vue({
      template: '<div><json-form v-ref:jsonform :content="content.foo" name="foo"></json-form></div>',
      components: {JsonForm},
      replace: false,
      store: store,
      data () {
        return {
          content: content
        }
      }
    }).$mount()
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    content = {
      foo: {
        properties: {
          bar: {
            properties: {
              baz: {
                val: 'one'
              },
              booz: {
                val: 'two'
              }
            }
          }
        }
      },
      oof: {
        val: 'con'
      }
    }

    JsonForm = JsonFormInjector({
      './JsonFormItem': mockedComponent,
      './JsonFormItemCheckbox': mockedComponent,
      './JsonFormItemNumber': mockedComponent,
      './JsonFormItemText': mockedComponent,
      './JsonFormItemArray/JsonFormItemArray': mockedComponent,
      './JsonFormItemProfileIds': mockedComponent
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('computed tests', () => {
    describe('path tests', () => {
      beforeEach(() => {
        initComponent()
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
          template: '<div><json-form v-ref:jsonform :content="content.foo" full-name-input="foo" name="bar"></json-form></div>',
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
          expect(vm.$refs.jsonform.path).to.equals('foo.bar')
          done()
        })
      })
    })

    describe('getComponentItem', () => {
      it('should get the component checkbox if the content is a checkbox type', () => {
        content = {foo: {type: 'boolean'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemCheckbox')
      })

      it('should get the component number if the content is a number type', () => {
        content = {foo: {type: 'integer'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {foo: {type: 'long'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {foo: {type: 'short'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {foo: {type: 'byte'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {foo: {type: 'double'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {foo: {type: 'float'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
      })

      it('should get the component checkbox if the content is a checkbox type', () => {
        content = {foo: {type: 'text'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemText')
      })

      it('should get the component checkbox if the content is an array type', () => {
        content = {foo: {type: 'array'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemArray')
      })

      it('should get the component checkbox if the content is an array type', () => {
        content = {foo: {type: 'profileIds'}}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemProfileIds')
      })
    })
  })

  describe('methods', () => {
    describe('isNested', () => {
      it('should return boolean to know if a content is has a nested object', () => {
        initComponent()
        expect(vm.$refs.jsonform.isNested({properties: {foo: {val: 'bar'}}})).to.equals(true)
      })

      it('should dispatch a mutation to add an attribute to the mapping of a document', () => {
        let $dispatch = sandbox.stub()

        initComponent()
        vm.$refs.jsonform.$dispatch = $dispatch
        vm.$refs.jsonform.addAttribute()
        expect($dispatch.calledWith('document-create::add-attribute', 'foo')).to.be.ok
      })
    })
  })
})
