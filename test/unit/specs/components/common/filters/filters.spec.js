import Vue from 'vue'
import { mockedComponent } from '../../../helper'
let FilterInjector = require('!!vue?inject!../../../../../../src/components/Common/Filters/Filters')

describe('Filter main component', () => {
  let vm = {}
  let Filter = FilterInjector({
    './RawFilter': mockedComponent,
    './BasicFilter': mockedComponent,
    './QuickFilter': mockedComponent,
    '../../Materialize/Tab': mockedComponent,
    '../../Materialize/Tabs': mockedComponent
  })

  describe('Watchers', () => {
    before(() => {
      vm = new Vue({
        template: '<div><filter v-ref:filter></filter></div>',
        components: {
          Filter
        }
      }).$mount()
    })

    beforeEach(() => {
      vm.$refs.filter.$broadcast = sinon.spy()
    })

    it('displayBlockFilter should broadcast an event when the value changes', (done) => {
      vm.$refs.filter.displayBlockFilter = true

      Vue.nextTick(() => {
        expect(vm.$refs.filter.$broadcast.calledWith('json-editor-refresh')).to.be.equal(true)
        done()
      })
    })

    it('tabActive should broadcast an event when the value changes', (done) => {
      vm.$refs.filter.tabActive = 'test'

      Vue.nextTick(() => {
        expect(vm.$refs.filter.$broadcast.calledWith('json-editor-refresh')).to.be.equal(true)
        done()
      })
    })
  })

  describe('Events', () => {
    before(() => {
      vm = new Vue({
        template: '<div><filter v-ref:filter></filter></div>',
        components: {
          Filter
        }
      }).$mount()
    })

    it('should pass displayBlockFilter to false on event filters-basic-search (click on button search)', (done) => {
      vm.$refs.filter.displayBlockFilter = true
      vm.$broadcast('filters-basic-search')

      Vue.nextTick(() => {
        expect(vm.$refs.filter.displayBlockFilter).to.be.equal(false)
        done()
      })
    })

    it('should pass displayBlockFilter to false on event filters-raw-search (click on button search)', (done) => {
      vm.$refs.filter.displayBlockFilter = true
      vm.$broadcast('filters-raw-search')

      Vue.nextTick(() => {
        expect(vm.$refs.filter.displayBlockFilter).to.be.equal(false)
        done()
      })
    })
  })

  describe('Methods', () => {
    before(() => {
      vm = new Vue({
        template: '<div><filter v-ref:filter></filter></div>',
        components: {
          Filter
        }
      }).$mount()
    })

    beforeEach(() => {
      vm.$refs.filter.$dispatch = sinon.spy()
    })

    it('should change tabActive on switchFilter call', () => {
      vm.$refs.filter.tabActive = 'tab1'
      vm.$refs.filter.switchFilter('tab2')

      expect(vm.$refs.filter.tabActive).to.be.equal('tab2')
    })

    it('should dispatch event on resetComplexSearch with empty filter', () => {
      vm.$refs.filter.resetComplexSearch()

      expect(vm.$refs.filter.$dispatch.calledWith('filters-raw-search', {})).to.be.equal(true)
    })

    it('should hide block filter on escape key', () => {
      let evt = {
        keyCode: 27
      }
      vm.$refs.filter.displayBlockFilter = true

      vm.$refs.filter.handleEsc(evt)

      expect(vm.$refs.filter.displayBlockFilter).to.be.not.ok
    })

    it('should dispatch event on refreshSearch', () => {
      vm.$refs.filter.refreshSearch()

      expect(vm.$refs.filter.$dispatch.calledWith('filters-refresh-search')).to.be.equal(true)
    })
  })
})
