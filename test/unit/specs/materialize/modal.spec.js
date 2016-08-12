import Vue from 'vue'
import Modal from '../../../../src/components/Materialize/Modal'

describe('Modal', () => {
  let vm

  beforeEach(() => {
    vm = new Vue({
      template: '<div><modal v-ref:modal id="myModal"></modal></div>',
      components: {
        Modal
      }
    }).$mount()
  })

  describe('Event', () => {
    it('modal-open must do nothing if modal id is not corresponding', () => {
      vm.$refs.modal.open = sinon.spy()
      vm.$broadcast('modal-open', 'otherModal')
      expect(vm.$refs.modal.open.calledOnce).to.be.equal(false)
    })

    it('modal-open must call open method the modal if id is corresponding', () => {
      vm.$refs.modal.open = sinon.spy()
      vm.$broadcast('modal-open', 'myModal')
      expect(vm.$refs.modal.open.calledOnce).to.be.equal(true)
    })

    it('modal-close must do nothing if modal id is not corresponding', () => {
      vm.$refs.modal.open()
      vm.$refs.modal.close = sinon.spy()
      vm.$broadcast('modal-close', 'otherModal')

      expect(vm.$refs.modal.close.calledOnce).to.be.equal(false)
    })

    it('modal-close must call close method the modal if id is corresponding', () => {
      vm.$refs.modal.open()
      vm.$refs.modal.close = sinon.spy()
      vm.$broadcast('modal-close', 'myModal')

      expect(vm.$refs.modal.close.calledOnce).to.be.equal(true)
    })

    it('should hide block filter on escape key', () => {
      let evt = {
        keyCode: 27
      }

      vm.$refs.modal.open()
      vm.$refs.modal.close = sinon.spy()

      vm.$refs.modal.handleEsc(evt)

      expect(vm.$refs.modal.close.calledOnce).to.be.equal(true)
    })

    it('should do nothing with any other key', () => {
      let evt = {
        keyCode: 4
      }

      vm.$refs.modal.open()
      vm.$refs.modal.close = sinon.spy()

      vm.$refs.modal.handleEsc(evt)

      expect(vm.$refs.modal.close.called).to.be.equal(false)
    })
  })

  describe('Method', () => {
    it('open should must set active to true', () => {
      vm.$refs.modal.active = false
      vm.$refs.modal.open()
      expect(vm.$refs.modal.active).to.be.equal(true)

      vm.$refs.modal.active = true
      vm.$refs.modal.open()
      expect(vm.$refs.modal.active).to.be.equal(true)
    })

    it('close should must set active to false', () => {
      vm.$refs.modal.active = true
      vm.$refs.modal.close()
      expect(vm.$refs.modal.active).to.be.equal(false)

      vm.$refs.modal.active = false
      vm.$refs.modal.close()
      expect(vm.$refs.modal.active).to.be.equal(false)
    })
  })

  describe('Computed', () => {
    it('computedClasses should return null if active is false', () => {
      vm.$refs.modal.active = false
      expect(vm.$refs.modal.computedClasses).to.be.equal(null)
    })

    it('computedClasses should return the class "bottom-modal bottom-sheet', () => {
      vm = new Vue({
        template: '<div><modal v-ref:modal id="myModal" :bottom="bottom"></modal></div>',
        components: {
          Modal
        },
        data () {
          return {
            bottom: true
          }
        }
      }).$mount()

      vm.$refs.modal.active = true
      expect(vm.$refs.modal.computedClasses).to.be.equal('bottom-modal bottom-sheet')
    })

    it('computedClasses should return the class "normal-modal"', () => {
      vm = new Vue({
        template: '<div><modal v-ref:modal id="myModal" :bottom="bottom"></modal></div>',
        components: {
          Modal
        },
        data () {
          return {
            bottom: false
          }
        }
      }).$mount()

      vm.$refs.modal.active = true
      expect(vm.$refs.modal.computedClasses).to.be.equal('normal-modal')
    })
  })
})
