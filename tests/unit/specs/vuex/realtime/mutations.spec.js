import { mutations } from '../../../../../src/vuex/modules/realtime/store'
import { expect } from 'chai'

const { ADD_NOTIFICATION, EMPTY_NOTIFICATION } = mutations

describe('Data mutation', () => {
  describe('ADD_NOTIFICATION', () => {
    it('should add a notification to the notifications array', () => {
      let state = {
        notifications: []
      }

      ADD_NOTIFICATION(state, { test: true })
      expect(state.notifications).to.deep.equals([{ test: true }])
    })
  })
  describe('EMPTY_NOTIFICATION', () => {
    it('should empty the notifications array', () => {
      let state = {
        notifications: [{ test: true }]
      }

      EMPTY_NOTIFICATION(state)
      expect(state.notifications).to.eql([])
    })
  })
})
