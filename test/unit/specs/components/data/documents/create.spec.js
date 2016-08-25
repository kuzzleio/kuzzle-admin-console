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
  let triggerError = true

  let refreshIndexSpy = sandbox.stub()
  let setNewDocumentSpy = sandbox.stub()
  let goSpy = sandbox.stub()

  const mockInjector = () => {
    Create = CreateInjector({
      './Common/CreateOrUpdate': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      '../Collections/Dropdown': mockedComponent,
      '../../../services/kuzzle': {
        dataCollectionFactory: sandbox.stub().returns({
          createDocumentPromise: () => {
            if (triggerError) {
              return Promise.reject('error')
            }
            return Promise.resolve()
          }
        }),
        refreshIndex: refreshIndexSpy
      }
    })

    vm = new Vue({
      template: '<div><create v-ref:create index="index" collection="collection"></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    $vm = vm.$refs.create
    $dispatch = sandbox.stub()
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

      it('should create the document and redirect', (done) => {
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
      it('should go back to the previous route', () => {
        $vm.$router = {_prevTransition: {to: 'route'}, go: goSpy}
        $vm.cancel()
        expect(goSpy.called).to.be.ok
      })

      it('should go to DataDocumentsList', () => {
        $vm.$router = {go: goSpy}
        $vm.cancel()
        expect(goSpy.calledWith({name: 'DataDocumentsList', params: {index: 'index', collection: 'collection'}})).to.be.ok
      })
    })
  })
})
