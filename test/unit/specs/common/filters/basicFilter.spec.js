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

    vm.$refs.basic.$dispatch = sandbox.spy()
  })

  afterEach(() => sandbox.restore())

  describe('Methods', () => {
    it('updateFilter should call setBasicFilter with a clone of current filters', () => {
      vm.$refs.basic.filters = {toto: 'tutu'}
      vm.$refs.basic.updateFilter()

      expect(setBasicFilterSpy.calledWith(vm.$refs.basic.filters)).to.be.equal(true)
      expect(setBasicFilterSpy.args[0][0]).to.not.be.equal(vm.$refs.basic.filters)
    })

    describe('basicSearch', () => {
      it('should dispatch an event with null if there is no filter nor sorting', () => {
        vm.$refs.basic.filters.basic = [[{attribute: null}]]
        vm.$refs.basic.filters.sorting = {attribute: null}

        vm.$refs.basic.basicSearch()
        expect(vm.$refs.basic.$dispatch.calledWith('filters-basic-search', null, null)).to.be.equal(true)
      })

      it('should dispatch an event without sorting if it is disabled', () => {
        vm.$refs.basic.filters.basic = [[{attribute: null}]]
        vm.$refs.basic.sortingEnabled = false

        vm.$refs.basic.basicSearch()
        expect(vm.$refs.basic.$dispatch.calledWith('filters-basic-search', null)).to.be.equal(true)
        vm.$refs.basic.sortingEnabled = true
      })

      it('should dispatch an event with filter and null for sorting', () => {
        vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]
        vm.$refs.basic.filters.sorting = {attribute: null}

        vm.$refs.basic.basicSearch()
        expect(vm.$refs.basic.$dispatch.calledWith('filters-basic-search', vm.$refs.basic.filters.basic, null)).to.be.equal(true)
      })

      it('should dispatch an event with sort', () => {
        vm.$refs.basic.filters.basic = [[{attribute: null}]]
        vm.$refs.basic.filters.sorting = {attribute: 'username', order: 'asc'}

        vm.$refs.basic.basicSearch()
        expect(vm.$refs.basic.$dispatch.calledWith('filters-basic-search', null, vm.$refs.basic.filters.sorting)).to.be.equal(true)
      })

      it('should dispatch an event with filters and sort', () => {
        vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]
        vm.$refs.basic.filters.sorting = {attribute: 'username', order: 'asc'}

        vm.$refs.basic.basicSearch()
        expect(vm.$refs.basic.$dispatch.calledWith('filters-basic-search', vm.$refs.basic.filters.basic, vm.$refs.basic.filters.sorting)).to.be.equal(true)
      })
    })

    it('should reset filters and sorting on resetBasicSearch call', () => {
      vm.$refs.basic.updateFilter = sandbox.spy()
      vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]
      vm.$refs.basic.filters.sorting = {attribute: 'username', order: 'asc'}

      vm.$refs.basic.resetBasicSearch()

      expect(vm.$refs.basic.filters.basic).to.be.deep.equal([[{attribute: null, operator: 'match', value: null}]])
      expect(vm.$refs.basic.filters.sorting).to.be.deep.equal({attribute: null, order: 'asc'})
      expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(true)
    })

    it('should add a group in basic and call updateFilter on addGroupBasicFilter call', () => {
      vm.$refs.basic.updateFilter = sandbox.spy()
      vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]

      vm.$refs.basic.addGroupBasicFilter()

      expect(vm.$refs.basic.filters.basic).to.be.deep.equal([
        [
          {attribute: 'username', operator: 'match', value: 'toto'}
        ],
        [
          {attribute: null, operator: 'match', value: null}
        ]
      ])
      expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(true)
    })

    describe('addAndBasicFilter', () => {
      it('should do nothing if call with wrong index', () => {
        vm.$refs.basic.updateFilter = sandbox.spy()
        vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]

        vm.$refs.basic.addAndBasicFilter(2)

        expect(vm.$refs.basic.filters.basic).to.be.deep.equal([[{attribute: 'username', operator: 'match', value: 'toto'}]])
        expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(false)
      })

      it('should add a filter in basic and call updateFilter', () => {
        vm.$refs.basic.updateFilter = sandbox.spy()
        vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]

        vm.$refs.basic.addAndBasicFilter(0)

        expect(vm.$refs.basic.filters.basic).to.be.deep.equal([
          [
            {attribute: 'username', operator: 'match', value: 'toto'},
            {attribute: null, operator: 'match', value: null}
          ]
        ])
        expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(true)
      })
    })

    describe('removeAndBasicFilter', () => {
      it('should do nothing if there is no group or no filterIndex corresponding to parameters', () => {
        vm.$refs.basic.updateFilter = sandbox.spy()
        vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}],
          [{attribute: null, operator: 'match', value: null}]]

        // bad group index
        vm.$refs.basic.removeAndBasicFilter(2, 0)
        // bad filter index
        vm.$refs.basic.removeAndBasicFilter(0, 2)

        expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(false)
      })

      it('should reset filter if there is only one', () => {
        vm.$refs.basic.updateFilter = sandbox.spy()
        vm.$refs.basic.filters.basic = [[{attribute: 'username', operator: 'match', value: 'toto'}]]

        vm.$refs.basic.removeAndBasicFilter(0, 0)

        expect(vm.$refs.basic.filters.basic).to.be.deep.equal([[{attribute: null, operator: 'match', value: null}]])
        expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(true)
      })

      it('should remove the group if there is only one filter in it', () => {
        vm.$refs.basic.updateFilter = sandbox.spy()
        vm.$refs.basic.filters.basic = [
          [
            {attribute: 'username', operator: 'match', value: 'toto'}
          ],
          [
            {attribute: 'username', operator: 'match', value: 'tutu'}
          ]
        ]

        vm.$refs.basic.removeAndBasicFilter(1, 0)

        expect(vm.$refs.basic.filters.basic).to.be.deep.equal([[{attribute: 'username', operator: 'match', value: 'toto'}]])
        expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(true)
      })

      it('should remove the right filter in right group', () => {
        vm.$refs.basic.updateFilter = sandbox.spy()
        vm.$refs.basic.filters.basic = [
          [
            {attribute: 'username', operator: 'match', value: 'toto'},
            {attribute: 'username', operator: 'match', value: 'titi'}
          ],
          [
            {attribute: 'username', operator: 'match', value: 'tutu'}
          ]
        ]

        vm.$refs.basic.removeAndBasicFilter(0, 1)

        expect(vm.$refs.basic.filters.basic).to.be.deep.equal([
          [
            {attribute: 'username', operator: 'match', value: 'toto'}
          ],
          [
            {attribute: 'username', operator: 'match', value: 'tutu'}
          ]
        ])
        expect(vm.$refs.basic.updateFilter.calledOnce).to.be.equal(true)
      })
    })
  })

  describe('Ready', () => {
    it('should set default value if nothing passed in props', () => {
      document.body.insertAdjacentHTML('afterbegin', '<app></app>')
      BasicFilter.methods.updateFilter = sandbox.spy()

      vm = new Vue({
        template: '<div><basic-filter v-ref:basic></basic-filter></div>',
        components: {
          BasicFilter
        }
      }).$mount('app')

      expect(vm.$refs.basic.filters.basic).to.be.deep.equal([[{attribute: null, operator: 'match', value: null}]])
      expect(vm.$refs.basic.filters.sorting).to.be.deep.equal({attribute: null, order: 'asc'})
      expect(BasicFilter.methods.updateFilter.calledOnce).to.be.equal(true)
    })

    it('should set sorting filter if it\'s passed in props', () => {
      let basicFilterProps = [[{attribute: 'username', operator: 'match', value: 'toto'}]]
      let sortingProps = {attribute: 'username', order: 'asc'}

      document.body.insertAdjacentHTML('afterbegin', '<app></app>')
      BasicFilter.methods.updateFilter = sandbox.spy()

      vm = new Vue({
        template: '<div><basic-filter v-ref:basic :basic-filter="basicFilterProps" :sorting="sortingProps"></basic-filter></div>',
        components: {
          BasicFilter
        },
        data () {
          return {
            basicFilterProps,
            sortingProps
          }
        }
      }).$mount('app')
      vm.$refs.basic.updateFilter = sandbox.spy()

      expect(vm.$refs.basic.filters.basic).to.be.deep.equal(basicFilterProps)
      expect(vm.$refs.basic.filters.sorting).to.be.deep.equal(sortingProps)
      expect(BasicFilter.methods.updateFilter.calledOnce).to.be.equal(true)
    })
  })
})
