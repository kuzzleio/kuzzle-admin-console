import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let CreateInjector = require('!!vue?inject!../../../../../../src/components/Data/Collections/Create')
let Create
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('Create collection component test', () => {
  let fetchCollectionDetail = sandbox.stub().returns()
  let resetCollectionDetail = sandbox.stub().returns()
  let createCollection = sandbox.stub().returns()
  let getCollectionsFromIndex = sandbox.stub().returns(Promise.resolve())
  let indexesAndCollections = sandbox.stub().returns({myindex: {realtime: [], stored: []}})
  let collectionName = sandbox.stub().returns()
  let $dispatch

  const mockInjector = () => {
    Create = CreateInjector({
      './CreateOrUpdate': mockedComponent,
      '../../../vuex/modules/collection/actions': {
        fetchCollectionDetail,
        resetCollectionDetail,
        createCollection
      },
      '../../../vuex/modules/data/actions': {
        getCollectionsFromIndex
      },
      '../../../vuex/modules/data/getters': {
        indexesAndCollections
      },
      '../../../vuex/modules/collection/getters': {
        collectionName
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><create v-ref:create index="myindex"></create></div>',
      components: { Create },
      replace: false,
      store
    }).$mount('body')

    $vm = vm.$refs.create
    $vm.$router = {go: sandbox.stub(), _children: {$remove: sandbox.stub()}}
    $dispatch = sandbox.stub($vm, '$dispatch')
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    describe('Create', () => {
      it('should display the toaster with error if create collection reject', (done) => {
        createCollection = sandbox.stub().returns(Promise.reject(new Error('kuzzle error')))
        mockInjector()

        $vm.create('toto', {toto: 'tutu'}, false)

        setTimeout(() => {
          expect(createCollection.calledWith(store, {realtime: [], stored: []}, 'myindex', 'toto', {toto: 'tutu'}, false)).to.be.equal(true)
          expect($dispatch.calledWith('toast', 'kuzzle error', 'error')).to.be.equal(true)
          done()
        }, 0)
      })

      it('should redirect on index summary if everything is fine', (done) => {
        createCollection = sandbox.stub().returns(Promise.resolve())
        mockInjector()

        $vm.create('toto', {toto: 'tutu'}, false)

        setTimeout(() => {
          expect(createCollection.calledWith(store, {realtime: [], stored: []}, 'myindex', 'toto', {toto: 'tutu'}, false)).to.be.equal(true)
          expect($vm.$router.go.calledWithMatch({name: 'DataIndexSummary', params: {index: 'myindex'}})).to.be.equal(true)
          done()
        }, 0)
      })
    })
  })
})
