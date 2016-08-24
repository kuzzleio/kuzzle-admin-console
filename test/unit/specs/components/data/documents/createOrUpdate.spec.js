import store from '../../../../../../src/vuex/store'
import Vue from 'vue'
import { mockedComponent } from '../../../helper'

let CreateInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/CreateOrUpdate')
let Create

describe('create document tests', () => {
  let sandbox
  let vm
  let dispatchSpy
  let broadcastSpy
  let refreshIndexSpy
  let routerSpy
  let unsetNewDocumentSpy
  let setNewDocumentSpy
  let setPartialSpy
  let mergeDeepSpy
  let formatGeoPointSpy
  let triggerError = true
  let addAttributeFromPathSpy
  let getUpdatedSchemaSpy

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
    dispatchSpy = sandbox.stub()
    broadcastSpy = sandbox.stub()
    refreshIndexSpy = sandbox.stub()
    routerSpy = {go: sandbox.stub(), _children: {$remove: sandbox.stub(), push: sandbox.stub()}}
    unsetNewDocumentSpy = sandbox.stub()
    setNewDocumentSpy = sandbox.stub()
    setPartialSpy = sandbox.stub()
    mergeDeepSpy = sandbox.stub()
    formatGeoPointSpy = sandbox.stub()
    addAttributeFromPathSpy = sandbox.stub()
    getUpdatedSchemaSpy = sandbox.stub().returns({properties: {}})

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
      },
      '../../../services/objectHelper': {
        mergeDeep: mergeDeepSpy,
        formatGeoPoint: formatGeoPointSpy
      },
      '../../../services/documentFormat': {
        addAttributeFromPath: addAttributeFromPathSpy,
        getUpdatedSchema: getUpdatedSchemaSpy
      }
    })

    vm = new Vue({
      template: '<div><create v-ref:create index="index" collection="collection"></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.create.$dispatch = dispatchSpy
    vm.$refs.create.$broadcast = broadcastSpy
    vm.$refs.create.$route = {params: {collection: 'coll', index: 'index'}}
    vm.$refs.create.$router = routerSpy
    vm.$refs.create.$refs.jsoneditor = {getJson: sandbox.stub().returns({foo: 'bar'})}
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

      it('should set the document from the json editor', () => {
        vm.$refs.create.viewState = 'code'
        vm.$refs.create.create()
        expect(setNewDocumentSpy.calledWith({_id: 42, foo: 'bar'}))
      })

      it('should create a document and redirect to DataCollectionBrowse', () => {
        triggerError = false
        vm.$refs.create.id = '42'
        vm.$refs.create.create()
        expect(refreshIndexSpy.called).to.be.ok
        expect(routerSpy.go.called).to.be.ok
      })
    })

    describe('cancel methods', () => {
      it('should go to the previous route', () => {
        let spy = sandbox.stub()
        vm.$refs.create.$router._prevTransition = sandbox.stub()
        vm.$refs.create.$router._prevTransition.to = sandbox.stub()
        vm.$refs.create.$router.go = spy
        vm.$refs.create.cancel()
        expect(spy.called).to.be.ok
      })

      it('should go to the DataDocumentsList route', () => {
        let spy = sandbox.stub()
        vm.$refs.create.$router.go = spy
        vm.$refs.create.cancel()
        expect(spy.calledWith({name: 'DataDocumentsList', params: {collection: 'collection', index: 'index'}})).to.be.ok
      })
    })

    describe('switchEditMode', () => {
      it('should merge mapping from the jsonform', () => {
        vm.$refs.create.viewState = 'code'
        vm.$refs.create.switchEditMode()
        expect(mergeDeepSpy.called).to.be.ok
      })

      it('should switch the viewState without merging', () => {
        vm.$refs.create.viewState = 'form'
        vm.$refs.create.switchEditMode()
        expect(mergeDeepSpy.called).to.be.not.ok
      })
    })

    describe('addRootAttr', () => {
      it('should open a modal', () => {
        vm.$refs.create.addRootAttr()
        expect(broadcastSpy.called).to.be.ok
      })
    })

    describe('doAddAttr', () => {
      it('should add a nested attribute and close the modal', () => {
        vm.$refs.create.newAttributeType = 'nested'
        vm.$refs.create.doAddAttr()
        expect(broadcastSpy.calledWith('modal-close', 'add-attr')).to.be.ok
      })

      it('should add attribute and close the modal', () => {
        vm.$refs.create.newAttributeType = 'boolean'
        vm.$refs.create.doAddAttr()
        expect(broadcastSpy.calledWith('modal-close', 'add-attr')).to.be.ok
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
