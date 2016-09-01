import store from '../../../../../../../src/vuex/store'
import Vue from 'vue'
import { mockedComponent, mockedDirective } from '../../../../helper'
import Promise from 'bluebird'

let CreateInjector = require('!!vue?inject!../../../../../../../src/components/Data/Documents/Common/CreateOrUpdate')
let Create

describe('createOrUpdate document tests', () => {
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
  let formatTypeSpy
  let triggerError = true
  let addAttributeFromPathSpy
  let getUpdatedSchemaSpy

  let mockInjector = () => {
    Create = CreateInjector({
      '../../Collections/Tabs': mockedComponent,
      '../../../../services/kuzzle': {
        dataCollectionFactory: () => {
          return {
            getMappingPromise: () => {
              if (triggerError) {
                return Promise.reject('error')
              }
              return Promise.resolve({mapping: {foo: 'bar'}})
            }
          }
        },
        refreshIndex: refreshIndexSpy
      },
      '../../../Common/JsonForm/JsonForm': mockedComponent,
      '../../../../vuex/modules/data/actions': {
        unsetNewDocument: unsetNewDocumentSpy,
        setNewDocument: setNewDocumentSpy,
        setPartial: setPartialSpy
      },
      '../../../../vuex/modules/data/getters': {
        newDocument: sandbox.stub().returns(42)
      },
      '../../../../services/objectHelper': {
        mergeDeep: mergeDeepSpy,
        formatType: formatTypeSpy
      },
      '../../../../services/documentFormat': {
        addAttributeFromPath: addAttributeFromPathSpy,
        getUpdatedSchema: getUpdatedSchemaSpy
      },
      '../../../../directives/focus.directive': mockedDirective
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><create v-ref:create index="index" collection="collection"></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount('body')

    vm.$refs.create.$dispatch = dispatchSpy
    vm.$refs.create.$broadcast = broadcastSpy
    vm.$refs.create.$route = {params: {collection: 'coll', index: 'index'}}
    vm.$refs.create.$router = routerSpy
    vm.$refs.create.$refs.jsoneditor = {getJson: sandbox.stub().returns({foo: 'bar'})}
  }

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
    formatTypeSpy = sandbox.stub()
    addAttributeFromPathSpy = sandbox.stub()
    getUpdatedSchemaSpy = sandbox.stub().returns({properties: {}})

    mockInjector()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('methods tests', () => {
    describe('create method test', () => {
      it('should get the json content and dispatch a create event', () => {
        vm.$refs.create.viewState = 'code'
        vm.$refs.create.create()
        expect(dispatchSpy.calledWith('document-create::create', 'code', {foo: 'bar'})).to.be.ok
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

  describe('ready', () => {
    it('should get the mapping of the current collection', (done) => {
      triggerError = false
      mockInjector()
      setTimeout(() => {
        expect(formatTypeSpy.calledWith({foo: 'bar'})).to.be.ok
        done()
      }, 0)
    })
  })
})
