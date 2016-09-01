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
  }

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

    describe('getComponentItem', () => {
      it('should get the component checkbox if the content is a checkbox type', () => {
        content = {type: 'boolean'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemCheckbox')
      })

      it('should get the component number if the content is a number type', () => {
        content = {type: 'integer'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {type: 'long'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {type: 'short'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {type: 'byte'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {type: 'double'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
        content = {type: 'float'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemNumber')
      })

      it('should get the component checkbox if the content is a checkbox type', () => {
        content = {type: 'text'}
        initComponent()
        expect(vm.$refs.jsonform.componentItem).to.equals('JsonFormItemText')
      })
    })
  })

  describe('methods', () => {
    describe('isNested', () => {
      it('should return boolean to know if a content is has a nested object', () => {
        initComponent()
        expect(vm.$refs.jsonform.isNested({properties: {foo: 'bar'}})).to.equals(true)
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
