import store from '../../../../../../src/vuex/store'
import Vue from 'vue'
import { mockedComponent } from '../../../helper'

let CreateInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/CreateOrUpdate')
let Create

describe('create document tests', () => {
  let sandbox
  let vm
  let dispatchSpy
  let refreshIndexSpy
  let routerSpy
  let unsetNewDocumentSpy
  let triggerError = true

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    dispatchSpy = sandbox.stub()
    refreshIndexSpy = sandbox.stub()
    routerSpy = {go: sandbox.stub(), _children: { $remove: sandbox.stub() }}
    unsetNewDocumentSpy = sandbox.stub()

    Create = CreateInjector({
      '../Collections/Tabs.vue': mockedComponent,
      '../Collections/Dropdown': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      '../../../services/kuzzle': {
        dataCollectionFactory: sandbox.stub().returns({
          createDocument: (doc, cb) => {
            if (triggerError) {
              cb({message: 'error'})
            } else {
              cb(null)
            }
          },
          getMapping: (cb) => {
            if (triggerError) {
              cb(new Error('error'))
            } else {
              cb(null, {mapping: {attr: 'falu'}})
            }
          }
        }),
        refreshIndex: refreshIndexSpy
      },
      '../../Common/JsonForm/JsonForm': mockedComponent,
      '../../../vuex/modules/data/actions': {
        unsetNewDocument: unsetNewDocumentSpy
      },
      '../../../vuex/modules/data/getters': {
        newDocument: sandbox.stub().returns(42)
      }
    })

    vm = new Vue({
      template: '<div><create v-ref:create></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.create.$dispatch = dispatchSpy
    vm.$refs.create.$route = {params: {collection: 'coll', index: 'index'}}
    vm.$refs.create.$router = routerSpy
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('create method test', () => {
      it('should dispatch an error toast event', () => {
        vm.$refs.create.create()
        expect(dispatchSpy.calledWith('toast', 'error', 'error')).to.be.ok
      })

      it('should create a document and redirect to DataCollectionBrowse', () => {
        triggerError = false
        vm.$refs.create.id = '42'
        vm.$refs.create.create()
        expect(refreshIndexSpy.called).to.be.ok
        expect(routerSpy.go.called).to.be.ok
      })
    })
  })

  describe('beforeDestroy test', () => {
    it('should unset the document before destroying the component', () => {
      vm.$destroy()
      expect(unsetNewDocumentSpy.called).to.be.ok
    })
  })

  describe('route data tests', () => {
    beforeEach(() => {
      Create.route.$route = {params: {index: 'index', collection: 'collection'}}
    })

    it('should do nothing if there is an error', () => {
      triggerError = true
      Create.route.data()
      expect(Create.route.mapping).to.be.undefined
    })

    it('should correctly set the mapping', () => {
      triggerError = false
      Create.route.data()
      console.log(Create.route.mapping)
      expect(Create.route.mapping).to.deep.equals({attr: 'falu'})
    })
  })
})
