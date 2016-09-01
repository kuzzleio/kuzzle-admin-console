import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent, mockedDirective } from '../../../helper'

let ListInjector = require('!!vue?inject!../../../../../../src/components/Data/Indexes/List')
let List
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('List indexes tests', () => {
  let listIndexesAndCollections = sandbox.stub()
  let indexesAndCollections = sandbox.stub().returns([])
  let canSearchIndex = sandbox.stub().returns(true)
  let canCreateIndex = sandbox.stub().returns(true)

  const mockInjector = () => {
    List = ListInjector({
      '../../Materialize/Headline': mockedComponent,
      './ModalCreate': mockedComponent,
      './Boxed': mockedComponent,
      '../../../directives/title.directive': mockedDirective,
      '../../../vuex/modules/data/actions': {
        listIndexesAndCollections
      },
      '../../../vuex/modules/data/getters': {
        indexesAndCollections
      },
      '../../../services/userAuthorization': {
        canSearchIndex,
        canCreateIndex
      }
    })

    document.body.insertAdjacentHTML('afterbegin', '<body></body>')
    vm = new Vue({
      template: '<div><list v-ref:list></list></div>',
      components: { List },
      replace: false,
      store: store
    }).$mount('body')

    $vm = vm.$refs.list
  }

  before(() => mockInjector())
  afterEach(() => sandbox.restore())

  describe('computed', () => {
    describe('countIndexForFilter', () => {
      it('should return total number of index for filter', () => {
        indexesAndCollections = sandbox.stub().returns({toto: {}, tutu: {}, foo: {}})
        mockInjector()

        $vm.filter = 'to'
        expect($vm.countIndexForFilter).to.be.equal(1)
      })
    })

    describe('indexesCount', () => {
      it('should return 0 if there is no index in store', () => {
        indexesAndCollections = sandbox.stub().returns(null)
        mockInjector()

        expect($vm.indexesCount).to.be.equal(0)
      })

      it('should return right number of indexes in store', () => {
        indexesAndCollections = sandbox.stub().returns({toto: {}, tutu: {}, foo: {}})
        mockInjector()

        expect($vm.indexesCount).to.be.equal(3)
      })
    })
  })

  describe('ready', () => {
    it('should do nothing if user can\'t search in index', () => {
      canSearchIndex = sandbox.stub().returns(false)
      listIndexesAndCollections = sandbox.stub()
      mockInjector()

      expect(listIndexesAndCollections.callCount).to.be.equal(0)
    })

    it('should call listIndexesAndCollections if user can search in index', () => {
      canSearchIndex = sandbox.stub().returns(true)
      listIndexesAndCollections = sandbox.stub()
      mockInjector()

      expect(listIndexesAndCollections.callCount).to.be.equal(1)
    })
  })
})
