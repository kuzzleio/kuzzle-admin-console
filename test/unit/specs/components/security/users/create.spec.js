import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import {mockedComponent} from '../../../helper'

describe('Create user component test', () => {
  let CreateInjector = require('!!vue?inject!../../../../../../src/components/Security/Users/Create')
  let Create
  let sandbox = sinon.sandbox.create()
  let vm
  let $vm
  let $dispatch
  let $broadcast
  let triggerError = true

  let refreshIndexSpy = sandbox.stub()
  let querySpy = sandbox.stub().returns(Promise.resolve())
  let setNewDocumentSpy = sandbox.stub()
  let setNewDocument = sandbox.stub()
  let newDocumentStub = sandbox.stub().returns({_id: '42'})

  const mockInjector = () => {
    Create = CreateInjector({
      './Common/CreateOrUpdate': mockedComponent,
      '../../Materialize/Headline': mockedComponent,
      '../Collections/Dropdown': mockedComponent,
      '../Collections/Tabs': mockedComponent,
      '../../../services/kuzzle': {
        queryPromise: querySpy,
        security: {
          createUserPromise: () => {
            if (triggerError) {
              return Promise.reject('error')
            }
            return Promise.resolve()
          }
        },
        refreshIndex: refreshIndexSpy
      },
      '../../../vuex/modules/data/getters': {
        newDocument: newDocumentStub
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

  beforeEach(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('methods test', () => {
    describe('create', () => {
      it('should display an error because the json document is invalid', () => {
        $vm.error = ''

        $vm.create('code')

        expect($vm.error).to.be.equal('The document is invalid, please review it')
      })

      it('should display an error because there is no "_id" field in the json document', () => {
        $vm.error = ''

        $vm.create('code', {})

        expect($vm.error).to.be.equal('The document must have a field "_id"')
      })

      it('should mutate a new json document', () => {
        mockInjector()
        $vm.setNewDocument = setNewDocumentSpy
        $vm.create('code', {_id: 'banana', foo: 'bar'})

        expect(setNewDocumentSpy.called).to.be.ok
      })

      it('should display an error because the field "Document identifier" is not set in the form', () => {
        $vm.error = ''
        newDocumentStub = sandbox.stub().returns({foo: '42'})
        mockInjector()

        $vm.create('form')

        expect($vm.error).to.be.equal('The document identifier is required')
      })

      it('should create the document and redirect', (done) => {
        triggerError = false
        $vm.$router = {go: sandbox.stub()}
        newDocumentStub = sandbox.stub().returns({_id: '42'})
        mockInjector()

        $vm.create('form')
          .then(() => {
            expect(querySpy.calledWith({controller: 'admin', action: 'refreshInternalIndex'}, {})).to.be.ok
            done()
          })
          .catch(error => {
            done(error)
          })
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
