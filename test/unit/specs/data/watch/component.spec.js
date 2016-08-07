import Vue from 'vue'
import { mockedComponent } from '../../helper'
import SubscriptionControls from '../../../../../src/components/Data/Realtime/SubscriptionControls'
import Notification from '../../../../../src/components/Data/Realtime/Notification'
import store from '../../../../../src/vuex/store'
import lolex from 'lolex'

let WatchLayoutInjector = require('!!vue?inject!../../../../../src/components/Data/Collections/Watch')

describe('SubscriptionControls tests', () => {
  let vm

  beforeEach(() => {
    vm = new Vue({
      template: '<div><subscription-controls v-ref:controls></subscription-controls></div>',
      components: { SubscriptionControls },
      replace: false,
      store: store
    }).$mount()
  })

  it('toggleSubscription: should dispach realtime-toggle-subscription event', () => {
    vm.$refs.controls.$dispatch = sinon.spy()

    vm.$refs.controls.toggleSubscription()

    expect(vm.$refs.controls.$dispatch.calledWith('realtime-toggle-subscription')).to.be.ok
  })

  it('clear: should dispach realtime-clear-messages event', () => {
    vm.$refs.controls.$dispatch = sinon.spy()

    vm.$refs.controls.clear()

    expect(vm.$refs.controls.$dispatch.calledWith('realtime-clear-messages')).to.be.ok
  })
})
describe('WatchData tests', () => {
  let WatchLayout = WatchLayoutInjector({
    '../../Materialize/Headline': mockedComponent,
    '../Realtime/Notification': mockedComponent,
    '../Realtime/SubscriptionControls': mockedComponent,
    '../Collections/Dropdown': mockedComponent,
    '../../Common/Filters/Filters': mockedComponent,
    '../../../vuex/modules/list/getters': {
      rawFilter: sinon.stub(),
      basicFilter: sinon.stub(),
      basicFilterForm: sinon.stub()
    },
    '../../../services/filterFormatRealtime': {
      availableFilters: sinon.stub(),
      formatFromBasicSearch: sinon.stub().returns({bar: 'foo'})
    }
  })

  describe('WatchLayout tests', () => {
    let vm

    beforeEach(() => {
      vm = new Vue({
        template: '<div><watch-layout v-ref:watch></watch-layout></div>',
        components: { WatchLayout },
        replace: false,
        store: store
      }).$mount()
    })

    describe('handleMessage', () => {
      it('should set the error message as warning message', () => {
        vm.$refs.watch.notifications = []
        vm.$refs.watch.warning.message = ''

        vm.$refs.watch.handleMessage(new Error('foo'))

        expect(vm.$refs.watch.notifications.length).to.equal(0)
        expect(vm.$refs.watch.warning.message).to.equal('foo')
      })

      it('should append message to notification list if limit is not reach', () => {
        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.notificationsLengthLimit = 10
        vm.$refs.watch.notificationToMessage = sinon.stub().returns('baz')

        vm.$refs.watch.handleMessage(null, {})

        expect(vm.$refs.watch.notifications.length).to.equal(3)
      })

      it('should remove 2 firsts notifications if messages reach length limit ', () => {
        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.notificationsLengthLimit = 1
        vm.$refs.watch.notificationToMessage = sinon.stub().returns('baz')

        vm.$refs.watch.handleMessage(null, {})

        expect(vm.$refs.watch.notifications.length).to.equal(1)
        expect(vm.$refs.watch.notifications[0]).to.equal('baz')
      })

      it('should set an error message if messages reach length limit', () => {
        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.notificationsLengthLimit = 1
        vm.$refs.watch.warning.message = ''
        vm.$refs.watch.notificationToMessage = sinon.stub().returns('baz')

        vm.$refs.watch.handleMessage(null, {})

        expect(vm.$refs.watch.warning.message).to.equal('Older notifications are discarded due to huge amount of items displayed')
      })

      it('should should not replace existing warning if messages reach length limit', () => {
        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.notificationsLengthLimit = 1
        vm.$refs.watch.warning.message = 'foo'
        vm.$refs.watch.notificationToMessage = sinon.stub().returns('baz')

        vm.$refs.watch.handleMessage(null, {})

        expect(vm.$refs.watch.warning.message).to.equal('foo')
      })

      it('should set an error message if he is receiving a lot amount of messages', () => {
        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.notificationsLengthLimit = 1
        vm.$refs.watch.warning.message = ''
        vm.$refs.watch.warning.lastTime = Date.now()
        vm.$refs.watch.warning.count = 99
        vm.$refs.watch.notificationToMessage = sinon.stub().returns('baz')

        vm.$refs.watch.handleMessage(null, {})

        expect(vm.$refs.watch.warning.message).to.equal('You are receiving too many messages, try to specify a filter to reduce the amount of messages')
      })
    })

    describe('toggleSubscription', () => {
      it('should call the subscribe method by default and set the KuzzleRoom', () => {
        vm.$refs.watch.subscribe = sinon.stub().returns('KuzzleRoom')

        vm.$refs.watch.toggleSubscription()
        expect(vm.$refs.watch.subscribe.called).to.be.ok
        expect(vm.$refs.watch.room).to.equal('KuzzleRoom')
      })

      it('should call the reset method if there is a subscription', () => {
        vm.$refs.watch.subscribed = true
        vm.$refs.watch.reset = sinon.spy()

        vm.$refs.watch.toggleSubscription()
        expect(vm.$refs.watch.reset.called).to.be.ok
      })
    })

    describe('basicSearch', () => {
      it('should refresh page with empty basic filter if no filter is given', () => {
        vm.$refs.watch.$router = {go: sinon.spy()}
        vm.$refs.watch.basicSearch()
        expect(vm.$refs.watch.$router.go.calledWith({query: {basicFilter: ''}})).to.equal(true)
      })
      it('should refresh page with stringified basic filter if set', () => {
        let filter = {foo: 'bar'}
        vm.$refs.watch.$router = {go: sinon.spy()}

        vm.$refs.watch.basicSearch(filter)

        expect(vm.$refs.watch.$router.go.calledWith({query: {basicFilter: JSON.stringify(filter)}})).to.equal(true)
      })
    })

    describe('rawSearch', () => {
      it('should refresh page with empty raw filter if no filter is given', () => {
        vm.$refs.watch.$router = {go: sinon.spy()}
        vm.$refs.watch.rawSearch()
        expect(vm.$refs.watch.$router.go.calledWith({query: {rawFilter: ''}})).to.equal(true)
      })
      it('should refresh page with stringified raw filter if set', () => {
        let filter = {foo: 'bar'}
        vm.$refs.watch.$router = {go: sinon.spy()}

        vm.$refs.watch.rawSearch(filter)

        expect(vm.$refs.watch.$router.go.calledWith({query: {rawFilter: JSON.stringify(filter)}})).to.equal(true)
      })
    })

    describe('unsubscribe', () => {
      it(' should clean warning message and stop subscription', () => {
        let unsubscribed = false
        let room = {
          unsubscribe () {
            unsubscribed = true
          }
        }

        vm.$refs.watch.subscribed = true
        vm.$refs.watch.warning.message = 'foo'
        vm.$refs.watch.warning.count = 10

        vm.$refs.watch.unsubscribe(room)

        expect(vm.$refs.watch.warning.message).to.equal('')
        expect(vm.$refs.watch.warning.count).to.equal(0)
        expect(unsubscribed).to.be.ok
      })
    })

    describe('reset', () => {
      it('should clean warning message, notifications and stop subscription', () => {
        let unsubscribed = false

        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.warning.message = 'foo'
        vm.$refs.watch.warning.count = 20
        vm.$refs.watch.subscribed = true
        vm.$refs.watch.room = {
          unsubscribe () {
            unsubscribed = true
          }
        }

        vm.$refs.watch.reset()

        expect(vm.$refs.watch.subscribed).to.equal(false)
        expect(vm.$refs.watch.warning.count).to.equal(0)
        expect(vm.$refs.watch.warning.message).to.equal('')
        expect(vm.$refs.watch.notifications.length).to.equal(0)
        expect(unsubscribed).to.equal(true)
      })

      it(' should not call unsubscribe if there is no subscription', () => {
        let unsubscribed = false

        vm.$refs.watch.subscribed = false
        vm.$refs.watch.room = {
          unsubscribe () {
            unsubscribed = true
          }
        }

        vm.$refs.watch.reset()

        expect(vm.$refs.watch.subscribed).to.equal(false)
        expect(unsubscribed).to.equal(false)
      })
    })

    describe('clear', () => {
      it(' should clean warning message and clean notifications', () => {
        vm.$refs.watch.notifications = ['foo', 'bar']
        vm.$refs.watch.warning.message = 'foo'
        vm.$refs.watch.warning.count = 20

        vm.$refs.watch.clear()

        expect(vm.$refs.watch.warning.count).to.equal(20)
        expect(vm.$refs.watch.warning.message).to.equal('')
        expect(vm.$refs.watch.notifications.length).to.equal(0)
      })
    })

    describe('route data', () => {
      beforeEach(() => {
        WatchLayout.route.basicFilter = null
        WatchLayout.route.rawFilter = null
        WatchLayout.route.filters = null
      })

      it('should set empty filter if called without args', () => {
        WatchLayout.route.data()
        expect(WatchLayout.route.filters).to.deep.equal({})
      })

      it('should set filter to rawFilter if set', () => {
        WatchLayout.route.rawFilter = {foo: 'bar'}
        WatchLayout.route.data()

        expect(WatchLayout.route.filters).to.deep.equal({foo: 'bar'})
      })

      it('should set filter to rawFilter if set', () => {
        WatchLayout.route.basicFilter = {foo: 'bar'}
        WatchLayout.route.data()

        expect(WatchLayout.route.filters).to.deep.equal({bar: 'foo'})
      })
    })

    describe('notificationToMessage', () => {
      let notification
      beforeEach(() => {
        notification = {
          timestamp: 1,
          metadata: {},
          result: {
            _id: 'foo',
            _source: {toto: 'tata'}
          }
        }
      })

      it('should have a base format', () => {
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.deep.equal({
          id: 'foo',
          text: '',
          icon: 'file',
          index: '',
          collection: '',
          'class': '',
          source: {
            source: {toto: 'tata'},
            metadata: {}
          },
          timestamp: 1,
          expanded: false,
          canEdit: true
        })
      })

      it('should have a specific publish format', () => {
        notification.action = 'publish'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Received volatile message',
          icon: 'send',
          'class': 'message-volatile',
          canEdit: false
        })
      })

      it('should have a specific create done format', () => {
        notification.action = 'create'
        notification.state = 'done'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Created new document',
          icon: 'file',
          'class': 'message-created-updated-doc'
        })
      })

      it('should have a specific create pending format', () => {
        notification.action = 'create'
        notification.state = 'pending'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Creating new document',
          icon: 'file',
          'class': 'message-pending'
        })
      })

      it('should have a specific createOrReplace done format', () => {
        notification.action = 'createOrReplace'
        notification.state = 'done'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Created new document',
          icon: 'file',
          'class': 'message-created-updated-doc'
        })
      })

      it('should have a specific createOrReplace pending format', () => {
        notification.action = 'createOrReplace'
        notification.state = 'pending'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Creating new document',
          icon: 'file',
          'class': 'message-pending'
        })
      })

      it('should have a specific update format', () => {
        notification.action = 'update'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Updated document',
          icon: 'file',
          'class': 'message-created-updated-doc'
        })
      })

      it('should have a specific delete done format', () => {
        notification.action = 'delete'
        notification.state = 'done'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Deleted document',
          icon: 'remove',
          'class': 'message-deleted-doc'
        })
      })

      it('should have a specific delete pending format', () => {
        notification.action = 'delete'
        notification.state = 'pending'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'Deleting document',
          icon: 'remove',
          'class': 'message-pending'
        })
      })

      it('should have a specific on subscribe format', () => {
        notification.metadata = {user: 'foo'}
        notification.action = 'on'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'A new user is listening to this room',
          icon: 'user',
          'class': 'message-user',
          canEdit: false,
          source: notification.metadata
        })
      })

      it('should have a specific off subscribe format', () => {
        notification.metadata = {user: 'foo'}
        notification.action = 'off'
        let message = vm.$refs.watch.notificationToMessage(notification)

        expect(message).to.include({
          text: 'A user exited this room',
          icon: 'user',
          'class': 'message-user',
          canEdit: false,
          source: notification.metadata
        })
      })
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
