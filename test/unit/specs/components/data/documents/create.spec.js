import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import {mockedComponent} from '../../../helper'

describe('Create component test', () => {
  let CreateInjector = require('!!vue?inject!../../../../../../src/components/Data/Documents/Create')
  let Create
  let sandbox = sinon.sandbox.create()
  let vm
  let $vm
  let $dispatch
  let $broadcast
  let triggerMappingError = true
  let triggerError = true

  let refreshIndexSpy = sandbox.stub()
  let setNewDocumentSpy = sandbox.stub()
  let setNewDocument = sandbox.stub()

  const mockInjector = () => {
    Create = CreateInjector({
      './Common/CreateOrUpdate': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      '../Collections/Dropdown': mockedComponent,
      '../Collections/Tabs': mockedComponent,
      '../../../services/kuzzle': {
        dataCollectionFactory: sandbox.stub().returns({
          dataMappingFactory () {
            return {
              applyPromise: () => {
                if (triggerMappingError) {
                  return Promise.reject('error')
                }
                return Promise.resolve()
              }
            }
          },
          createDocumentPromise: () => {
            if (triggerError) {
              return Promise.reject('error')
            }
            return Promise.resolve()
          }
        }),
        refreshIndex: refreshIndexSpy
      },
      '../../../vuex/modules/data/getters': {
        newDocument: sandbox.stub()
      },
      '../../../vuex/modules/data/actions': {
        setNewDocument
      }
    })

    vm = new Vue({
      template: '<div><create v-ref:create index="index" collection="collection"></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    $vm = vm.$refs.create
    $vm.$router = {_prevTransition: {to: sandbox.stub()}, go: sandbox.stub()}
    $dispatch = sandbox.stub($vm, '$dispatch')
    $broadcast = sandbox.stub()
    $vm.$broadcast = $broadcast
    $vm.$dispatch = $dispatch
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('methods test', () => {
    describe('create', () => {
      it('should dispatch an error because the json document is invalid', () => {
        $vm.create('code')
        expect($dispatch.calledWith('toast', 'Invalid document', 'error'))
      })

      it('should mutate a new json document', () => {
        mockInjector()
        $vm.setNewDocument = setNewDocumentSpy
        $vm.create('code', {foo: 'bar'})
        expect(setNewDocumentSpy.called).to.be.ok
      })

      it('should fail if mapping is not well formated', (done) => {
        triggerMappingError = true
        triggerError = false
        $vm.$router = {go: sandbox.stub()}
        mockInjector()
        $vm.create('form', {foo: 'bar'})
        setTimeout(() => {
          expect(refreshIndexSpy.called).to.be.ok
          done()
        }, 0)
      })
    })

    describe('cancel', () => {
      it('should broadcast document-create::cancel', () => {
        $vm.$router.go.reset()
        $vm.cancel()
        expect($vm.$router.go.callCount).to.be.equal(1)
      })
    })
  })
})
