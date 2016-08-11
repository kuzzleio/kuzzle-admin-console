import Promise from 'bluebird'
import { testAction, testActionPromise } from '../helper'
import { SET_TOKEN_VALID } from '../../../../src/vuex/modules/auth/mutation-types'
import SessionUser from '../../../../src/models/SessionUser'
const actionsInjector = require('inject!../../../../src/vuex/modules/auth/actions')

let triggerError

describe('doLogin action', () => {
  let addListenerEvent
  let addListenerCallCB
  let removeAllListenersEvent

  const actions = actionsInjector({
    '../../../services/kuzzle': {
      removeAllListeners (event) {
        removeAllListenersEvent = event
      },
      addListener (event, cb) {
        addListenerEvent = event
        if (addListenerCallCB) {
          cb()
        }
      },
      loginPromise () {
        return new Promise((resolve, reject) => {
          if (triggerError.login) {
            reject(new Error('error'))
          } else {
            resolve({_id: 'foo', jwt: 'jwt'})
          }
        })
      },
      whoAmIPromise () {
        return new Promise((resolve, reject) => {
          if (triggerError.whoAmI) {
            reject(new Error('error'))
          } else {
            resolve({content: {foo: 'bar'}})
          }
        })
      },
      getMyRightsPromise () {
        return new Promise((resolve, reject) => {
          if (triggerError.getMyRights) {
            reject(new Error('error'))
          } else {
            resolve([{controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'}])
          }
        })
      }
    },
    '../../../services/router': {
      go: sinon.mock()
    },
    '../../../services/userCookies': {
      set: sinon.spy(),
      get: sinon.spy(),
      delete: sinon.spy()
    }
  })

  beforeEach(() => {
    addListenerEvent = false
    removeAllListenersEvent = false
    addListenerCallCB = false

    triggerError = {
      login: false,
      whoAmI: false,
      getMyRights: false
    }
  })

  it('should catch error if login fail', (done) => {
    triggerError.login = true
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('error')
      done()
    })
  })

  it('should catch error if whoAmI fail', (done) => {
    triggerError.whoAmI = true
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('error')
      done()
    })
  })

  it('should catch error if getMyRights fail', (done) => {
    triggerError.getMyRights = true
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('error')
      done()
    })
  })

  it('should dispatch the logged user and the token valid mutation', (done) => {
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [
      {
        name: 'SET_CURRENT_USER',
        payload: [{
          id: 'foo',
          token: 'jwt',
          params: {foo: 'bar'},
          rights: [{controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'}]
        }]
      },
      {
        name: 'SET_TOKEN_VALID',
        payload: [true]
      }
    ], done)
  })

  it('should register jwtTokenExpired kuzzle listener', (done) => {
    let mutationJwtTokenExpired = false
    let store = {
      dispatch (event, value) {
        if (event === SET_TOKEN_VALID && value === false) {
          mutationJwtTokenExpired = true
        }
      }
    }

    addListenerCallCB = true

    actions.doLogin(store, 'user', 'pwd')
      .then(() => {
        expect(removeAllListenersEvent).to.equals('jwtTokenExpired')
        expect(addListenerEvent).to.equals('jwtTokenExpired')
        expect(mutationJwtTokenExpired).to.be.ok

        done()
      })
  })
})

describe('loginFromCookie action', () => {
  let kuzzleState = 'connecting'
  let cookieUndefined = false
  let isTokenValid = true

  const actions = actionsInjector({
    '../../../services/kuzzle': {
      state: kuzzleState,
      checkTokenPromise: () => {
        return new Promise((resolve, reject) => {
          if (triggerError) {
            reject(new Error('error'))
          } else {
            resolve({valid: isTokenValid})
          }
        })
      },
      setJwtToken: sinon.mock(),
      addListener (type, cb) {
        this.state = 'connected'
        cb()
      },
      removeListener: sinon.mock()
    },
    '../../../services/userCookies': {
      get () {
        return cookieUndefined ? undefined : {
          id: 'foo',
          token: 'jwt',
          params: {foo: 'bar'},
          rights: [{controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'}]
        }
      }
    }
  })

  beforeEach(() => {
    kuzzleState = 'connecting'
    cookieUndefined = false
    triggerError = false
    isTokenValid = true
  })

  it('should login user from cookie', (done) => {
    testAction(actions.loginFromCookie, [() => {}], {}, [
      {
        name: 'SET_CURRENT_USER',
        payload: [{
          id: 'foo',
          token: 'jwt',
          params: {foo: 'bar'},
          rights: [{controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'}]
        }]
      }
    ], done)
  })

  it('should not login user from cookie because there is no cookie', (done) => {
    cookieUndefined = true

    testAction(actions.loginFromCookie, [() => {}], {}, [
      {
        name: 'SET_CURRENT_USER',
        payload: [SessionUser()]
      }
    ], done)
  })

  it('should not login user from cookie because the jwt token is wrong', (done) => {
    isTokenValid = false

    testAction(actions.loginFromCookie, [() => {}], {}, [
      {
        name: 'SET_CURRENT_USER',
        payload: [SessionUser()]
      }
    ], done)
  })

  it('should not login user from cookie because kuzzle errored', (done) => {
    triggerError = true

    testAction(actions.loginFromCookie, [() => {}], {}, [
      {
        name: 'SET_CURRENT_USER',
        payload: [SessionUser()]
      }
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
    testAction(actions.doLogout, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [SessionUser()] },
      { name: 'SET_TOKEN_VALID', payload: [false] }
    ], done)
  })
})
