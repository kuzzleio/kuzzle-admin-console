import Vue from 'vue'
import Tab from '../../../../src/components/Materialize/Tab'

describe('Tab component', () => {
  let sandbox = sinon.sandbox.create()
  let $dispatch = {}
  let vm = {}

  beforeEach(() => {
    vm = new Vue({
      template: '<div><tab v-ref:tab></tab></div>',
      components: {
        Tab
      }
    }).$mount()

    $dispatch = sandbox.stub(vm.$refs.tab, '$dispatch')
  })

  afterEach(() => sandbox.restore())

  describe('Events', () => {
    describe('tab-select', () => {
      it('should call select function on tab-select event', () => {
        let select = sandbox.stub(vm.$refs.tab, 'select')
        vm.$refs.tab.$emit('tab-select')

        expect(select.calledOnce).to.be.equal(false)
      })

      it('should do nothing on tab-select event with no id', () => {
        let select = sandbox.stub(vm.$refs.tab, 'select')
        vm.$refs.tab.$emit('tab-select', 'name')

        expect(select.calledWith('name')).to.be.equal(true)
      })
    })
  })

  describe('Computed', () => {
    describe('computedClasses', () => {
      it('should return the class disabled if the component is disabled', () => {
        vm.$refs.tab.disabled = true

        expect(vm.$refs.tab.computedClasses).to.be.deep.equal(['disabled'])
      })

      it('should return an empty array if the component is not disabled', () => {
        vm.$refs.tab.disabled = false

        expect(vm.$refs.tab.computedClasses).to.be.deep.equal([])
      })
    })

    describe('index', () => {
      it('should return the current index of the current component', () => {
        expect(vm.$refs.tab.index).to.be.equal(0)
      })
    })
  })

  describe('Methods', () => {
    describe('setAsSelected', () => {
      it('should do nothing if the current tab is not disabled', () => {
        vm.$refs.tab.disabled = true
        vm.$refs.tab.setAsSelected()

        expect($dispatch.callCount).to.be.equal(0)
      })

      it('should dispatch event tabs-on-select if the current tab is not disabled', () => {
        vm.$refs.tab.disabled = false
        vm.$refs.tab.setAsSelected()

        expect($dispatch.calledWith('tabs-on-select', vm.$refs.tab)).to.be.equal(true)
      })
    })

    describe('select', () => {
      it('should do nothing if the name in parameter is not the name of current tab', () => {
        let setAsSelected = sandbox.stub(vm.$refs.tab, 'setAsSelected')
        vm.$refs.tab.name = 'toto'

        vm.$refs.tab.select('tutu')
        expect(setAsSelected.callCount).to.be.equal(0)
      })

      it('should call setAsSelected if the name in parameter is the name of current tab', () => {
        let setAsSelected = sandbox.stub(vm.$refs.tab, 'setAsSelected')
        vm.$refs.tab.name = 'toto'

        vm.$refs.tab.select('toto')
        expect(setAsSelected.callCount).to.be.equal(1)
      })
    })
  })
})
