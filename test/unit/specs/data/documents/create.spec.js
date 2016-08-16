import store from '../../../../../src/vuex/store'
import Vue from 'vue'

let CreateInjector = require('!!vue?inject!../../../../../src/components/Data/Documents/Create')
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
      '../../../services/kuzzle': {
        dataCollectionFactory: sandbox.stub().returns({
          createDocument: (doc, cb) => {
            if (triggerError) {
              cb({message: 'error'})
            } else {
              cb(null)
            }
          }
        }),
        '../../../vuex/modules/data/actions': {
          unsetNewDocument: unsetNewDocumentSpy
        },
        refreshIndex: refreshIndexSpy
      }
    })

    vm = new Vue({
      template: '<div><create v-ref:create></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    vm.$refs.create.$dispatch = dispatchSpy
    vm.$refs.create.$route = {params: {collection: 'coll'}}
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

  // describe('beforeDestroy test', () => {
  //   it('should unset the document before destroying the component', () => {
  //     vm.$destroy()
  //     expect(unsetNewDocumentSpy.called).to.be.ok
  //   })
  // })
})
