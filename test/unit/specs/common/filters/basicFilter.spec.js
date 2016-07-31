import Vue from 'vue'
import BasicFilter from '../../../../../src/components/Common/Filters/BasicFilter'

describe('Basic filter component', () => {
  let vm = {}
  let sandbox = sinon.sandbox.create()
  let setBasicFilterSpy = sandbox.spy()

  before(() => {
    vm = new Vue({
      template: '<div><basic-filter v-ref:basic :set-basic-filter="setBasicFilter"></basic-filter></div>',
      components: {
        BasicFilter
      },
      data () {
        return {
          setBasicFilter: setBasicFilterSpy
        }
      }
    }).$mount()
  })

  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    it('updateFilter should call setBasicFilter with a clone of current filters', () => {
      vm.$refs.basic.filters = {toto: 'tutu'}
      vm.$refs.basic.updateFilter()

      expect(setBasicFilterSpy.calledWith(vm.$refs.basic.filters)).to.be.equal(true)
      expect(setBasicFilterSpy.args[0][0]).to.not.be.equal(vm.$refs.basic.filters)
    })
  })
})
