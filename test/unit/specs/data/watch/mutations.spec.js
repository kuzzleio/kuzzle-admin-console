import { mutations } from '../../../../../src/vuex/modules/data/store'

const { ADD_NOTIFICATION, EMPTY_NOTIFICATION } = mutations

describe('data watch mutations test', () => {
  it('should add a notification', () => {
    let state = {notifications: []}

    ADD_NOTIFICATION(state, 'foo')
    expect(state.notifications[0]).to.equals('foo')
    ADD_NOTIFICATION(state, 'bar')
    expect(state.notifications[1]).to.equals('bar')
  })

  it('should empty notifications', () => {
    let state = {notifications: []}

    ADD_NOTIFICATION(state, 'foo')
    EMPTY_NOTIFICATION(state)
    expect(state.notifications.length).to.equals(0)
  })
})

