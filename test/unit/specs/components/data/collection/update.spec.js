import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let UpdateInjector = require('!!vue?inject!../../../../../../src/components/Data/Collections/Update.vue')
let Update
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('Update collection component test', () => {
  let fetchCollectionDetail = sandbox.stub().returns(Promise.resolve())
  let listIndexesAndCollections = sandbox.stub().returns(Promise.resolve())
  let indexesAndCollections = sandbox.stub().returns({myindex: {realtime: [], stored: []}})
  let collectionName = sandbox.stub().returns()
  let $dispatch

  const mockInjector = (kuzzleStub = sandbox.stub()) => {
    Update = UpdateInjector({
      './CreateOrUpdate': mockedComponent,
      '../../../vuex/modules/collection/actions': {
        fetchCollectionDetail
      },
      '../../../vuex/modules/data/actions': {
        listIndexesAndCollections
      },
      '../../../vuex/modules/data/getters': {
        indexesAndCollections
      },
      '../../../vuex/modules/collection/getters': {
        collectionName
      },
      '../../../services/kuzzle': {
        dataCollectionFactory () {
          return {
            dataMappingFactory () {
              return {
                applyPromise: kuzzleStub
              }
            }
          }
        }
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><update v-ref:update index="myindex"></update></div>',
      components: { Update },
      replace: false,
      store: store
    }).$mount('body')

    $vm = vm.$refs.update
    $vm.$router = {go: sandbox.stub()}
    $dispatch = sandbox.stub($vm, '$dispatch')
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Computed', () => {
    describe('headline', () => {
      it('should return a string with update and the collection name', () => {
        collectionName = sandbox.stub().returns('toto')
        mockInjector()

        expect($vm.headline).to.be.equal('Update toto')
      })
    })
  })

  describe('Methods', () => {
    describe('Update', () => {
      it('should do nothing if the collection is realtime only and redirect on index summary', (done) => {
        let kuzzleStub = sandbox.stub().returns(Promise.resolve())
        mockInjector(kuzzleStub)

        $vm.update('toto', {}, true)

        setTimeout(() => {
          expect(kuzzleStub.callCount).to.be.equal(0)
          expect($vm.$router.go.calledWithMatch({name: 'DataIndexSummary', params: {index: 'myindex'}})).to.be.equal(true)
          done()
        }, 0)
      })

      it('should set error if kuzzle reject', (done) => {
        let kuzzleStub = sandbox.stub().returns(Promise.reject(new Error('kuzzle error')))
        mockInjector(kuzzleStub)

        $vm.update('toto', {}, false)

        setTimeout(() => {
          expect($vm.error).to.be.equal('kuzzle error')
          done()
        }, 0)
      })

      it('should redirect to index summary if everything is fine', (done) => {
        let kuzzleStub = sandbox.stub().returns(Promise.resolve())
        mockInjector(kuzzleStub)

        $vm.update('toto', {toto: 'tutu'}, false)

        setTimeout(() => {
          expect($vm.$router.go.calledWithMatch({name: 'DataIndexSummary', params: {index: 'myindex'}}))
          done()
        }, 0)
      })
    })
  })

  describe('Ready', () => {
    it('should display toaster with error and go on index summary if the collection doesn\'t exist', (done) => {
      fetchCollectionDetail = sandbox.stub().returns(Promise.reject(new Error('kuzzle error')))
      mockInjector()

      setTimeout(() => {
        expect($dispatch.calledWith('toast', 'kuzzle error', 'error')).to.be.equal(true)
        expect($vm.$router.go.calledWithMatch({name: 'DataIndexSummary', params: {index: 'myindex'}}))
        done()
      }, 0)
    })

    it('should fetch collection detail with right params if the collection exists', (done) => {
      let myindex = {realtime: ['toto'], stored: ['tutu']}
      indexesAndCollections = sandbox.stub().returns({myindex})
      collectionName = sandbox.stub().returns('titi')
      mockInjector()

      setTimeout(() => {
        expect(fetchCollectionDetail.calledWith(store, myindex, 'myindex', 'titi')).to.be.equal(true)
        done()
      }, 0)
    })
  })
})
