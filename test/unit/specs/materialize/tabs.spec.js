import Vue from 'vue'
let TabsInjector = require('!!vue?inject!../../../../src/components/Materialize/Tabs')

describe('Tabs component', () => {
  let sandbox = sinon.sandbox.create()
  let velocityStub = sinon.stub()
  let $emit = {}
  let $broadcast = {}
  let vm = {}

  beforeEach(() => {
    velocityStub.reset()
    let Tabs = TabsInjector({
      'velocity-animate': velocityStub
    })
    vm = new Vue({
      template: '<div><tabs v-ref:tabs active="something"></tabs></div>',
      components: {
        Tabs
      }
    }).$mount()

    $emit = sandbox.stub(vm.$refs.tabs, '$emit')
    $broadcast = sandbox.stub(vm.$refs.tabs, '$broadcast')
  })

  afterEach(() => sandbox.restore())

  describe('Watcher', () => {
    it('should emit an event on active change', (done) => {
      vm.$refs.tabs.active = 'otherTab'

      Vue.nextTick(() => {
        expect($emit.calledWith('tab-changed', 'otherTab'))
        done()
      })
    })

    it('should do nothing isDisplayed change if isDisplayed is false', (done) => {
      vm.$refs.tabs.isDisplayed = false

      Vue.nextTick(() => {
        expect($broadcast.calledOnce).to.be.equal(false)
        done()
      })
    })

    it('should broadcast an event on isDisplayed change', (done) => {
      vm.$refs.tabs.isDisplayed = true
      vm.$refs.tabs.active = 'anotherTab'

      Vue.nextTick(() => {
        expect($broadcast.calledWith('tab-select', 'anotherTab')).to.be.equal(true)
        done()
      })
    })
  })

  describe('Events', () => {
    it('should call select function on tabs-on-select event', () => {
      let select = sandbox.stub(vm.$refs.tabs, 'select')
      $emit.restore()
      vm.$refs.tabs.$emit('tabs-on-select', 'other')

      expect(select.calledWith('other')).to.be.equal(true)
    })
  })

  describe('Computed', () => {
    describe('tabsCount', () => {
      it('should return the right tabs count', () => {
        vm.$refs.tabs.$set('$children', ['firstChild', 'secondChild'])
        expect(vm.$refs.tabs.tabsCount).to.be.equal(2)
      })
    })
  })

  describe('Methods', () => {
    describe('Select', () => {
      it('should call moveIndicator with right parameters', () => {
        let moveIndicator = sandbox.stub(vm.$refs.tabs, 'moveIndicator')
        let tab = {id: 'basic', $el: {offsetLeft: 10, offsetWidth: 20, parentElement: {offsetWidth: 30}}}

        vm.$refs.tabs.select(tab)
        expect(moveIndicator.calledWith(10, 0)).to.be.equal(true)
        expect(vm.$refs.tabs.activeTab).to.be.deep.equal(tab)
        expect(vm.$refs.tabs.active).to.be.equal('basic')
      })
    })

    describe('resizeIndicator', () => {
      it('should do nothing if there is no active tab', () => {
        vm.$refs.tabs.$els.indicator = {style: {right: '10px', left: '20px'}}
        vm.$refs.tabs.activeTab = null

        vm.$refs.tabs.resizeIndicator()
        expect(vm.$refs.tabs.$els.indicator.style.right).to.be.equal('10px')
        expect(vm.$refs.tabs.$els.indicator.style.left).to.be.equal('20px')
      })

      it('should do nothing if tab or tabs width 0', () => {
        vm.$refs.tabs.$els.indicator = {style: {right: '10px', left: '20px'}}
        vm.$refs.tabs.tabsCount = 4
        vm.$refs.tabs.activeTab = {index: 1, $el: {parentElement: {offsetWidth: 0, scrollWidth: 2}}}

        vm.$refs.tabs.resizeIndicator()
        expect(vm.$refs.tabs.$els.indicator.style.right).to.be.equal('10px')
        expect(vm.$refs.tabs.$els.indicator.style.left).to.be.equal('20px')
      })

      it('should change right and left style', () => {
        vm.$refs.tabs.$els.indicator = {style: {right: '10px', left: '20px'}}
        vm.$refs.tabs.$set('$children', ['firstChild', 'secondChild'])
        vm.$refs.tabs.activeTab = {index: 1, $el: {parentElement: {offsetWidth: 10, scrollWidth: 2}}}

        vm.$refs.tabs.resizeIndicator()

        expect(vm.$refs.tabs.$els.indicator.style.right).to.be.equal('0px')
        expect(vm.$refs.tabs.$els.indicator.style.left).to.be.equal('5px')
      })
    })

    describe('moveIndicator', () => {
      it('should call velocity library with new right/left position', () => {
        vm.$refs.tabs.moveIndicator(10, 20)

        expect(velocityStub.args[0][1]).to.be.deep.equal({right: 20, left: 10})
      })
    })
  })

  describe('Ready', () => {
    it('should call broadcast with current active tab', () => {
      let Tabs = TabsInjector({
        'velocity-animate': velocityStub
      })
      document.body.insertAdjacentHTML('afterbegin', '<app></app>')
      vm = new Vue({
        template: '<div><tabs v-ref:tabs active="something"></tabs></div>',
        components: {
          Tabs
        }
      }).$mount('app')

      expect($broadcast.calledWith('tab-select', 'something'))
    })

    it('should call broadcast with current active tab', () => {
      let Tabs = TabsInjector({
        'velocity-animate': velocityStub
      })
      document.body.insertAdjacentHTML('afterbegin', '<app></app>')
      vm = new Vue({
        template: '<div><tabs v-ref:tabs></tabs></div>',
        components: {
          Tabs
        }
      }).$mount('app')

      expect($broadcast.called).to.be.equal(false)
    })
  })
})
