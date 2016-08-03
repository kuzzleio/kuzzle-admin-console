import Vue from 'vue'
import CreateLayout from '../../../../src/components/Data/Collections/Create'
import store from '../../../../src/vuex/store'

describe('CreateCollection tests', () => {
  describe('CreateCollection layout display', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><create-layout v-ref:create></create-layout></div>',
        components: {CreateLayout},
        replace: false,
        store: store
      }).$mount()
      vm.$refs.create.createCollection = sinon.stub().returns(Promise.resolve())
      vm.$refs.create.$route = {
        params: {
          index: 'index'
        }
      }
    })

    it('should return a rejected promise', () => {
      setTimeout(() => {
        vm.$refs.create.doCreateCollection()
        expect(vm.$refs.create.createCollection.called).to.be.ok
      }, 0)
    })
  })
})
