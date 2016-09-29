import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let CreateOrUpdateInjector = require('!!vue?inject!../../../../../../src/components/Data/Collections/CreateOrUpdate')
let CreateOrUpdate
let sandbox = sinon.sandbox.create()
let vm
let $vm
let $dispatch

describe('CreateOrUpdate collections test', () => {
  let resetCollectionDetail = sandbox.stub().returns()
  let mapping = sandbox.stub().returns()
  let collectionName = sandbox.stub().returns()
  let collectionIsRealtimeOnly = sandbox.stub().returns()

  const mockInjector = () => {
    CreateOrUpdate = CreateOrUpdateInjector({
      '../../Materialize/Headline': mockedComponent,
      '../../Common/JsonEditor': mockedComponent,
      '../../../vuex/modules/collection/actions': {
        resetCollectionDetail
      },
      '../../../vuex/modules/collection/getters': {
        mapping,
        collectionName,
        collectionIsRealtimeOnly
      }
    })

    vm = new Vue({
      template: '<div><create-or-update v-ref:create index="myindex"></create-or-update></div>',
      components: { CreateOrUpdate },
      replace: false,
      store: store
    }).$mount()

    $vm = vm.$refs.create
    $dispatch = sandbox.stub($vm, '$dispatch')
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('Watch', () => {
    describe('collectionIsRealtimeOnly', () => {
      it('should set isRealtime', () => {
        mockInjector()
        CreateOrUpdate.watch.isRealtimeOnly = false

        CreateOrUpdate.watch.collectionIsRealtimeOnly(true)
        expect(CreateOrUpdate.watch.isRealtimeOnly).to.be.equal(true)
      })
    })
  })

  describe('Methods', () => {
    describe('Create', () => {
      it('should dispatch event create with name', () => {
        mockInjector()
        $vm.name = 'toto'
        $vm.$refs = {
          jsoneditor: {
            getJson: () => {
              return {toto: 'tutu'}
            }
          }
        }
        $vm.isRealtimeOnly = false
        $vm.create()

        expect($dispatch.calledWith('collection-create::create', 'toto', {toto: 'tutu'}, false))
      })

      it('should dispatch event create with collectionName', () => {
        collectionName = sandbox.stub().returns('tutu')
        mockInjector()
        $vm.name = null
        $vm.$refs = {
          jsoneditor: {
            getJson: () => {
              return {toto: 'tutu'}
            }
          }
        }
        $vm.isRealtimeOnly = false
        $vm.create()

        expect($dispatch.calledWith('collection-create::create', 'tutu', {toto: 'tutu'}, false))
      })
    })

    describe('Cancel', () => {
      it('should redirect on previous page if the user is from the site', () => {
        mockInjector()

        $vm.$router = {go: sandbox.stub(), _prevTransition: {to: 'toto'}}
        $vm.cancel()

        expect($vm.$router.go.calledWith('toto')).to.be.equal(true)
      })

      it('should redirect on index summary if user come from other site', () => {
        mockInjector()

        $vm.$router = {go: sandbox.stub(), _prevTransition: {to: null}}
        $vm.cancel()

        expect($vm.$router.go.calledWith({name: 'DataIndexSummary', params: {index: 'myindex'}})).to.be.equal(true)
      })
    })

    describe('dismissError', () => {
      it('should dispatch reset error event', () => {
        mockInjector()

        $vm.dismissError()

        expect($dispatch.calledWith('collection-create::reset-error')).to.be.equal(true)
      })
    })
  })

  describe('BeforeDestroy', () => {
    it('should resetCollectionDetail', () => {
      mockInjector()
      $vm.$destroy()
      expect(resetCollectionDetail.callCount).to.be.equal(1)
    })
  })
})

