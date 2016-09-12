import Vue from 'vue'
import QuickSearch from '../../../../../../src/components/Common/Filters/QuickFilter'

describe('Quick filter component', () => {
  describe('Method', () => {
    let vm = {}
    let sandbox = sinon.sandbox.create()

    before(() => {
      vm = new Vue({
        template: '<div><quick-search v-ref:quick></quick-search></div>',
        components: {
          QuickSearch
        }
      }).$mount()

      vm.$refs.quick.$dispatch = sandbox.spy()
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('should dispatch an event on quickSearch call', () => {
      vm.$refs.quick.filters = {searchTerm: 'test'}
      vm.$refs.quick.quickSearch()

      expect(vm.$refs.quick.$dispatch.calledWith('filters-quick-search', 'test')).to.be.equal(true)
    })

    it('should dispatch an event on resetQuickSearch call and reset searchTerm', () => {
      vm.$refs.quick.filters = {searchTerm: 'test'}
      vm.$refs.quick.resetQuickSearch()

      expect(vm.$refs.quick.filters.searchTerm).to.be.equal(null)
      expect(vm.$refs.quick.$dispatch.calledWith('filters-quick-search', null)).to.be.equal(true)
    })

    it('should dispatch an event on displayComplexSearch call', () => {
      vm.$refs.quick.displayComplexSearch()

      expect(vm.$refs.quick.$dispatch.calledWith('filters-display-block-filter')).to.be.equal(true)
    })
  })

  describe('Ready', () => {
    it('should init searchTerm value with the props', () => {
      document.body.insertAdjacentHTML('afterbegin', '<app></app>')

      let vm = new Vue({
        template: '<div><quick-search v-ref:quick :search-term="searchTerm"></quick-search></div>',
        components: {
          QuickSearch
        },
        data () {
          return {searchTerm: 'test'}
        }
      }).$mount('app')

      expect(vm.$refs.quick.filters.searchTerm).to.be.equal('test')
    })
  })
})
