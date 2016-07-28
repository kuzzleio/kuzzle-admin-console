import {testAction} from '../../helper'
const actionsInjector = require('inject!../../../../../src/vuex/modules/data/actions')

describe('Watch data', () => {
  let notification = {}
  let expectedPayload = {}

  let triggerError = false
  let actions
  let unsubscribeSpy = sinon.spy()
  let testIt = (done) => {
    actions = actionsInjector({
      '../../../services/kuzzle': {
        dataCollectionFactory: () => {
          return {
            subscribe: (filter, opt, cb) => {
              if (triggerError) {
                cb({})
              } else {
                cb(null, notification)
              }
              return {
                unsubscribe: unsubscribeSpy
              }
            }
          }
        }
      }
    })

    testAction(actions.subscribe, [], {}, [
      { name: 'ADD_NOTIFICATION', payload: [expectedPayload] }
    ], done)
  }

  describe('subscribe test', () => {
    beforeEach(() => {
      notification = {
        error: null,
        status: 200,
        roomId: 'da3dee16062fe682f9db583ae0ba51bf',
        requestId: '5175a91a-b2e7-4d93-a53f-1ad4b95e6620',
        index: 'kuzzle-bo-testindex',
        collection: 'kuzzle-bo-test',
        controller: 'write',
        action: 'publish',
        protocol: 'rest',
        timestamp: 1469523898873,
        metadata: {},
        scope: 'in',
        state: 'done',
        result: {
          _source: {
            foo: 'bar'
          }
        }
      }
      expectedPayload = { id: undefined,
        text: 'Received volatile message',
        icon: 'send',
        index: 'kuzzle-bo-testindex',
        collection: 'kuzzle-bo-test',
        class: 'message-volatile',
        source: { source: { foo: 'bar' }, metadata: {} },
        expanded: false,
        canEdit: true,
        timestamp: 1469523898873 }
    })

    it('should format message correctly as a publish action', (done) => {
      expectedPayload.canEdit = false
      testIt(done)
    })

    it('should format message correctly as a create action', (done) => {
      notification.action = 'create'
      expectedPayload.text = 'Created new document'
      expectedPayload.class = 'message-created-updated-doc'
      expectedPayload.icon = 'file'
      testIt(done)
    })

    it('should format message correctly as a create action in pending', (done) => {
      notification.action = 'create'
      notification.state = 'pending'
      expectedPayload.text = 'Creating new document'
      expectedPayload.class = 'message-pending'
      expectedPayload.icon = 'file'
      testIt(done)
    })

    it('should format message correctly as an update action', (done) => {
      notification.action = 'update'
      expectedPayload.text = 'Updated document'
      expectedPayload.class = 'message-created-updated-doc'
      expectedPayload.icon = 'file'
      testIt(done)
    })

    it('should format message correctly as a delete action', (done) => {
      notification.action = 'delete'
      notification.state = 'done'
      expectedPayload.text = 'Deleted document'
      expectedPayload.class = 'message-deleted-doc'
      expectedPayload.icon = 'remove'
      expectedPayload.canEdit = false
      testIt(done)
    })

    it('should format message correctly as a delete action on pending', (done) => {
      notification.action = 'delete'
      notification.state = 'pending'
      expectedPayload.text = 'Deleting document'
      expectedPayload.class = 'message-pending'
      expectedPayload.icon = 'remove'
      expectedPayload.canEdit = false
      testIt(done)
    })

    it('should format message correctly as a on action', (done) => {
      notification.action = 'on'
      notification.metadata = {foo: 'bar'}
      expectedPayload.text = 'A new user is listening to this room'
      expectedPayload.class = 'message-user'
      expectedPayload.icon = 'user'
      expectedPayload.canEdit = false
      expectedPayload.source = notification.metadata
      testIt(done)
    })

    it('should format message correctly as a off action', (done) => {
      notification.action = 'off'
      notification.metadata = {foo: 'bar'}
      expectedPayload.text = 'A user exited this room'
      expectedPayload.class = 'message-user'
      expectedPayload.icon = 'user'
      expectedPayload.canEdit = false
      expectedPayload.source = notification.metadata
      testIt(done)
    })

    it('should do nothing on error', () => {
      let spy = {
        dispatch: sinon.spy()
      }
      triggerError = true
      actions.subscribe(spy)
      expect(spy.called).to.not.be.ok
    })
  })

  describe('unsubscribe test', () => {
    it('should call unsubscribe from the room', () => {
      actions.unsubscribe({}, {unsubscribe: () => { unsubscribeSpy() }})
      expect(unsubscribeSpy.called).to.be.ok
    })
  })

  describe('clear test', () => {
    it('should clear the notifications', (done) => {
      testAction(actions.clear, [], {}, [
        { name: 'EMPTY_NOTIFICATION', payload: [] }
      ], done)
    })
  })
})
