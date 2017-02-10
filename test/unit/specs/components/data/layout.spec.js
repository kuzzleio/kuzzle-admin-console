import Vue from 'vue'
import store from '../../../../../src/vuex/store'
import DataRoutes from '../../../../../src/routes/subRoutes/data'
import { mockedComponent } from '../../helper'
import VueRouter from 'vue-router'

// Vue.use(VueRouter)

let LayoutInjector = require('!!vue?inject!../../../../../src/components/Data/Layout')
let Layout
let sandbox = sinon.sandbox.create()

describe('Data Layout', () => {
  let router
  let listIndexesAndCollections = sandbox.stub()

  const mockInjector = () => {
    Layout = LayoutInjector({
      '../../services/userAuthorization': {
        canSearchIndex: sandbox.stub().returns(true)
      },
      '../../vuex/modules/data/actions': {
        listIndexesAndCollections
      },
      '../../vuex/modules/data/getters': {
        selectedIndex: sandbox.stub(),
        selectedCollection: sandbox.stub()
      },
      './Leftnav/Treeview': mockedComponent
    })

    const App = Vue.extend({
      template: '<div><layout v-ref:layout></layout></div>',
      components: { Layout },
      replace: false,
      store
    })

    router = new VueRouter({ abstract: true })
    router.map(DataRoutes)
    router.start(App, 'body')
  }

  before(() => mockInjector())

  afterEach(() => sandbox.restore())

  describe('Watch', () => {
    it('should call listIndexesAndCollections on selectedIndex change', () => {
      Layout.watch.canSearchIndex = sandbox.stub().returns(true)
      Layout.watch.listIndexesAndCollections = sandbox.stub().returns(true)
      Layout.watch.selectedIndex()
      expect(Layout.watch.listIndexesAndCollections.callCount).to.be.equal(1)
    })
  })

  describe('Ready', () => {
    it('should call listIndexesAndCollections', () => {
      expect(listIndexesAndCollections.callCount).to.be.equal(1)
    })
  })
})
