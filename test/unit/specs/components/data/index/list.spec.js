import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent, mockedDirective } from '../../../helper'

let ListInjector = require('!!vue?inject!../../../../../../src/components/Data/Indexes/List')
let List
let sandbox = sinon.sandbox.create()
let vm
let $vm

describe('List indexes tests', () => {
  let indexes = sandbox.stub().returns([])
  let indexesAndCollections = sandbox.stub().returns({})
  let canSearchIndex = sandbox.stub().returns(true)
  let canCreateIndex = sandbox.stub().returns(true)

  const mockInjector = () => {
    List = ListInjector({
      '../../Materialize/Headline': mockedComponent,
      './ModalCreate': mockedComponent,
      './Boxed': mockedComponent,
      '../../../directives/title.directive': mockedDirective('title'),
      '../../../vuex/modules/data/getters': {
        indexes,
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
  })
})
