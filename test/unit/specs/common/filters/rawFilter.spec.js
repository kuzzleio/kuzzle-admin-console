import Vue from 'vue'
import { mockedComponent } from '../../helper'
let RawFilterInjector = require('!!vue?inject!../../../../../src/components/Common/Filters/RawFilter')

describe('Raw Filter component', () => {
  describe('Methods', () => {
    describe('rawSearch', () => {
      it('should set error to true and do nothing if json is invalid', () => {
        let RawFilter = RawFilterInjector({
          '../../Common/JsonEditor': Vue.extend({
            template: '<div></div>',
            methods: {
              getJson: sinon.stub().returns(null)
            }
          })
        })
        let vm = new Vue({
          template: '<div><raw-filter v-ref:raw ></raw-filter></div>',
          components: {
            RawFilter
          }
        }).$mount()

        vm.$refs.raw.$dispatch = sinon.spy()
        vm.$refs.raw.rawSearch()

        expect(vm.$refs.raw.jsonInvalid).to.be.equal(true)
        expect(vm.$refs.raw.$dispatch.calledOnce).to.be.equal(false)
      })

      it('should set the error to false, set the raw value to the value provided and dispatch event', () => {
        let RawFilter = RawFilterInjector({
          '../../Common/JsonEditor': Vue.extend({
            template: '<div></div>',
            methods: {
              getJson: sinon.stub().returns({query: {test: 'toto'}})
            }
          })
        })
        let vm = new Vue({
          template: '<div><raw-filter v-ref:raw ></raw-filter></div>',
          components: {
            RawFilter
          }
        }).$mount()

        vm.$refs.raw.$dispatch = sinon.spy()
        vm.$refs.raw.rawSearch()

        expect(vm.$refs.raw.jsonInvalid).to.be.equal(false)
        expect(vm.$refs.raw.filters.raw).to.be.deep.equal({query: {test: 'toto'}})
        expect(vm.$refs.raw.$dispatch.calledWith({query: {test: 'toto'}})).to.be.equal(false)
      })
    })

    describe('fillRawWithBasic', () => {
      let vm = {}
      let sandbox = sinon.sandbox.create()
      let formatFromBasicSearch = sandbox.stub()
      let formatSort = sandbox.stub()
      let $broadcast = sandbox.spy()
      let basicFilterForm = {}

      before(() => {
        let RawFilter = RawFilterInjector({
          '../../Common/JsonEditor': mockedComponent
        })
        vm = new Vue({
          template: `<div><raw-filter 
              v-ref:raw 
              :basic-filter-form="basicFilterForm" 
              :format-from-basic-search="formatFromBasicSearch"
              :format-sort="formatSort"
              :raw-filter="{}"
            </raw-filter></div>`,
          components: {
            RawFilter
          },
          data () {
            return {basicFilterForm}
          },
          methods: {
            formatFromBasicSearch,
            formatSort
          }
        }).$mount()

        vm.$refs.raw.$broadcast = $broadcast
      })

      afterEach(() => sandbox.restore())

      it('should fill with empty filter/sorting if props is empty', () => {
        vm.$refs.raw.fillRawWithBasic()
        expect(Object.freeze(vm.$refs.raw.filters.raw)).to.be.deep.equal({})
        expect($broadcast.calledWith('json-editor-refresh')).to.be.equal(true)
      })

      it('should copy value from props and call format functions', () => {
        // fake basicFilterForm: not used for build raw json (user format functions)
        vm.$refs.raw.basicFilterForm = {basic: true, sorting: true}
        vm.$refs.raw.formatFromBasicSearch = sinon.stub().returns({query: 'filter'})
        vm.$refs.raw.formatSort = sinon.stub().returns({attribute: 'username', order: 'asc'})

        vm.$refs.raw.fillRawWithBasic()

        expect(vm.$refs.raw.filters.raw).to.be.deep.equal({query: 'filter', sort: {attribute: 'username', order: 'asc'}})
        expect($broadcast.calledWith('json-editor-refresh')).to.be.equal(true)
      })
    })

    it('should reset raw filter on resetRawSearch call', () => {
      let RawFilter = RawFilterInjector({
        '../../Common/JsonEditor': mockedComponent
      })
      let vm = new Vue({
        template: '<div><raw-filter v-ref:raw></raw-filter></div>',
        components: {
          RawFilter
        }
      }).$mount()

      vm.$refs.raw.filters = {raw: {toto: 'tutu'}}
      vm.$refs.raw.resetRawSearch()
      expect(vm.$refs.raw.filters).to.be.deep.equal({raw: {}})
    })
  })

  describe('Ready', () => {
    it('should set the value from props', () => {
      document.body.insertAdjacentHTML('afterbegin', '<app></app>')
      let rawFilterProps = {query: 'toto', sort: {attribute: 'username', order: 'asc'}}
      let RawFilter = RawFilterInjector({
        '../../Common/JsonEditor': mockedComponent
      })
      let vm = new Vue({
        template: '<div><raw-filter v-ref:raw :raw-filter="rawFilterProps"></raw-filter></div>',
        components: {
          RawFilter
        },
        data () {
          return {rawFilterProps}
        }
      }).$mount('app')

      expect(vm.$refs.raw.filters.raw).to.be.deep.equal(rawFilterProps)
    })
  })
})
