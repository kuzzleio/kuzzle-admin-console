import Vue from 'vue'
import store from '../../../../../../src/vuex/store'
import { mockedComponent } from '../../../helper'

let CreateInjector = require('!!vue?inject!../../../../../../src/components/Security/Common/CreateOrUpdate')
let Create
let sandbox = sinon.sandbox.create()

describe('Security common create', () => {
  let vm
  let $dispatch

  before(() => {
    Create = CreateInjector({
      '../../Common/JsonEditor': mockedComponent,
      '../../Materialize/Headline': mockedComponent
    })

    vm = new Vue({
      template: '<div><create v-ref:create></create></div>',
      components: {Create},
      replace: false,
      store: store
    }).$mount()

    $dispatch = sandbox.stub(vm.$refs.create, '$dispatch')
  })

  describe('Methods', () => {
    it('should dispatch event on create', () => {
      vm.$refs.create.id = 'toto'
      vm.$refs.create.$refs = {jsoneditor: {getJson: sandbox.stub().returns({toto: 'tutu'})}}

      vm.$refs.create.create()
      expect($dispatch.calledWithMatch('security-create::create', 'toto', {toto: 'tutu'})).to.be.equal(true)
    })

    it('should dispatch event on cancel', () => {
      vm.$refs.create.cancel()
      expect($dispatch.calledWithMatch('security-create::cancel')).to.be.equal(true)
    })
  })
})
