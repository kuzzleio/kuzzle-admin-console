import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let UpdateInjector = require('!!vue?inject!../../../../../../src/components/Data/Collections/Update.vue')
let Update
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('Update collection component test', () => {
  let fetchCollectionDetail = sandbox.stub().returns()
  let getCollectionsFromIndex = sandbox.stub().returns(Promise.resolve())
  let collections = sandbox.stub().returns()
  let collectionName = sandbox.stub().returns()
  let $dispatch

  const mockInjector = (kuzzleStub = sandbox.stub()) => {
    Update = UpdateInjector({
      './CreateOrUpdate': mockedComponent,
      '../../../vuex/modules/collection/actions': {
        fetchCollectionDetail
      },
      '../../../vuex/modules/data/actions': {
        getCollectionsFromIndex
      },
      '../../../vuex/modules/data/getters': {
        collections
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

      it('should call toaster with error if kuzzle reject', (done) => {
        let kuzzleStub = sandbox.stub().returns(Promise.reject(new Error('Kuzzle error')))
        mockInjector(kuzzleStub)

        $vm.update('toto', {}, false)

        setTimeout(() => {
          expect($dispatch.calledWith('toast', 'Kuzzle error', 'error')).to.be.equal(true)
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
      getCollectionsFromIndex = sandbox.stub().returns(Promise.reject(new Error('not exists')))
      mockInjector()

      setTimeout(() => {
        expect($dispatch.calledWith('toast', 'not exists', 'error')).to.be.equal(true)
        expect($vm.$router.go.calledWithMatch({name: 'DataIndexSummary', params: {index: 'myindex'}}))
        done()
      }, 0)
    })

    it('should fetch collection detail with right params if the collection exists', (done) => {
      getCollectionsFromIndex = sandbox.stub().returns(Promise.resolve())
      collections = sandbox.stub().returns(['toto', 'tutu'])
      collectionName = sandbox.stub().returns('titi')
      mockInjector()

      setTimeout(() => {
        expect(fetchCollectionDetail.calledWith(store, ['toto', 'tutu'], 'myindex', 'titi')).to.be.equal(true)
        done()
      }, 0)
    })
  })
})
