import Vue from 'vue'
import WatchLayout from '../../../../../src/components/Data/Collections/Watch'
import Notification from '../../../../../src/components/Data/Realtime/Notification'
import store from '../../../../../src/vuex/store'
import lolex from 'lolex'

describe('WatchData tests', () => {
  describe('WatchData layout display', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><watch-layout v-ref:watch></watch-layout></div>',
        components: { WatchLayout },
        replace: false,
        store: store
      }).$mount()
      vm.$refs.watch.subscribe = sinon.spy()
      vm.$refs.watch.unsubscribe = sinon.spy()
    })

    it('should call the subscribe method', () => {
      vm.$refs.watch.manageSub()
      expect(vm.$refs.watch.subscribe.called).to.be.ok
    })

    it('should call the unsubscribe method', () => {
      vm.$refs.watch.subscribed = true
      vm.$refs.watch.manageSub()
      expect(vm.$refs.watch.unsubscribe.called).to.be.ok
    })
  })

  describe('WatchData Notification component tests', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><notification v-ref:notif :notification="notification"></notification></div>',
        components: { Notification },
        replace: false,
        store: store,
        data () {
          return {
            notification: {
              timestamp: 1469607830
            }
          }
        }
      }).$mount()
    })

    it('should toggle collapse', () => {
      expect(vm.$refs.notif.collapsed).to.equal(true)
      vm.$refs.notif.toggleCollapse()
      expect(vm.$refs.notif.collapsed).to.equal(false)
    })

    it('should update timestamp to display the "ago"', () => {
      let clock = lolex.install()
      vm.$refs.notif.$options.ready[0].call(vm)
      clock.tick(60000)
      clock.uninstall()
      expect(vm.$refs.notif.notification.ago).to.not.equal(1469607830)
    })
  })
})
