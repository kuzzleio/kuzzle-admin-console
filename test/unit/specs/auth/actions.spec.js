import { testAction } from '../helper'
const actionsInjector = require('inject!../../../../src/vuex/modules/auth/actions')

let triggerError = true

describe('doLogin action', () => {
  const actions = actionsInjector({
    '../../../services/kuzzle': {
      login (strategy, credentials, expires, cb) {
        if (triggerError) {
          cb({message: 'error'})
        } else {
          cb(null, {_id: 'foo', jwt: 'jwt'})
        }
      }
    },
    '../../../services/router': {
      go: sinon.mock()
    }
  })

  it('should set an error on login', (done) => {
    testAction(actions.doLogin, ['user', 'pwd'], {}, [
      { name: 'SET_ERROR', payload: ['error'] }
    ], done)
  })

  it('should login a user', (done) => {
    triggerError = false
    testAction(actions.doLogin, ['user', 'pwd'], {}, [
      { name: 'SET_CURRENT_USER', payload: [{ _id: 'foo', jwt: 'jwt' }] }
    ], done)
  })
})

describe('loginFromCookie action', () => {
  let kuzzleState = 'connecting'
  const actions = actionsInjector({
    '../../../services/kuzzle': {
      state: kuzzleState,
      checkToken: (jwt, cb) => {
        if (triggerError) {
          cb({message: 'error'})
        } else {
          cb(null, {valid: true})
        }
      },
      setJwtToken: sinon.mock(),
      addListener (type, cb) {
        this.state = 'connected'
        cb()
      },
      removeListener: sinon.mock()
    },
    '../../../services/cookies': {
      get () {
        return {
          _id: 'foo',
          jwt: 'jwt'
        }
      }
    }
  })

  it('should login user from cookie', (done) => {
    triggerError = false
    testAction(actions.loginFromCookie, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [{ _id: 'foo', jwt: 'jwt' }] }
    ], done)
  })

  it('should not login user from cookie because the jwt token is wrong', (done) => {
    triggerError = true
    testAction(actions.loginFromCookie, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [null] }
    ], done)
  })
})

describe('logout action', () => {
  const actions = actionsInjector({
    '../../../services/kuzzle': {
      logout: sinon.mock()
    },
    '../../../services/cookie': {
      delete: sinon.mock()
    },
    '../../../services/router': {
      go: sinon.mock()
    }
  })

  it('should logout user', (done) => {
    testAction(actions.logout, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [null] }
    ], done)
  })
})
