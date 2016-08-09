import Vue from 'vue'
import {mockedComponent} from '../../helper'
import store from '../../../../../src/vuex/store'
const createLayoutInjector = require('inject!../../../../../src/components/Data/Collections/Create')

describe('CreateCollection tests', () => {
  let CreateLayout = createLayoutInjector({
    '../../Materialize/Headline': mockedComponent,
    '../../Common/JsonEditor': mockedComponent
  })
  describe('CreateCollection layout display', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><create-layout v-ref:create></create-layout></div>',
        components: {CreateLayout},
        replace: false,
        store: store
      }).$mount()
      vm.$refs.create.$router = {go: sinon.spy()}
      vm.$refs.create.$route = {
        params: {
          index: 'index'
        }
      }
    })

    it('should return a rejected promise', (done) => {
      sinon.stub(vm.$refs.create, 'createCollection').returns(Promise.resolve())
      vm.$refs.create.doCreateCollection()

      setTimeout(() => {
        expect(vm.$refs.create.createCollection.called).to.be.ok
        expect(vm.$refs.create.$router.go.called).to.be.ok
        done()
      }, 0)
    })
  })
})
