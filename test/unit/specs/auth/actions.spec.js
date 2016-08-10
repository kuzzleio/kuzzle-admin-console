import { testAction, testActionPromise } from '../helper'
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
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('error')
      done()
    })
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
  let actions

  const injectMock = (userInCookie, userIsValid = true) => {
    actions = actionsInjector({
      '../../../services/kuzzle': {
        state: kuzzleState,
        checkTokenPromise: () => {
          if (triggerError) {
            return Promise.reject(new Error('error from Kuzzle'))
          } else {
            if (userIsValid) {
              return Promise.resolve({valid: true})
            }

            return Promise.resolve({valid: false})
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
          return userInCookie
        }
      }
    })
  }

  it('should login user from cookie', (done) => {
    triggerError = false
    injectMock({_id: 'foo', jwt: 'jwt'})
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [{ _id: 'foo', jwt: 'jwt' }] }
    ], done)
  })

  it('should not login user from cookie because the jwt token is wrong', (done) => {
    triggerError = true
    injectMock({_id: 'foo', jwt: 'jwt'})
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [null] }
    ])
      .catch((e) => {
        expect(e.message).to.be.equal('error from Kuzzle')
        done()
      })
  })

  it('should resolve null and do nothing if there is no user', (done) => {
    triggerError = false
    injectMock(null)
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [null] }
    ], done)
  })

  it('should resolve null and do nothing if there is user in cookie but with bad token', (done) => {
    triggerError = false
    injectMock({_id: 'foo', jwt: 'jwt'}, false)
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: 'SET_CURRENT_USER', payload: [null] }
    ], done)
  })
})

describe('checkFirstAdmin action', () => {
  let kuzzleState = 'connecting'
  let actions

  const injectMock = (exists = true) => {
    actions = actionsInjector({
      '../../../services/kuzzle': {
        state: kuzzleState,
        queryPromise: () => {
          if (triggerError) {
            return Promise.reject(new Error('error from Kuzzle'))
          } else {
            if (exists) {
              return Promise.resolve({result: true})
            }

            return Promise.resolve({result: false})
          }
        }
      }
    })
  }

  it('should reject if error comes from Kuzzle', (done) => {
    triggerError = true
    injectMock({_id: 'foo', jwt: 'jwt'})
    testActionPromise(actions.checkFirstAdmin, [], {}, [])
      .catch((e) => {
        expect(e.message).to.be.equal('error from Kuzzle')
        done()
      })
  })

  it('should dispatch true if admin already exists', (done) => {
    triggerError = false
    injectMock(true)
    testActionPromise(actions.checkFirstAdmin, [], {}, [
      { name: 'SET_ADMIN_EXISTS', payload: [true] }
    ], done)
  })

  it('should dispatch false if there is no admin', (done) => {
    triggerError = false
    injectMock(false)
    testActionPromise(actions.checkFirstAdmin, [], {}, [
      { name: 'SET_ADMIN_EXISTS', payload: [false] }
    ], done)
  })
})

describe('setFirstAdmin action', () => {
  let actions = actionsInjector({})

  it('should dispatch true', (done) => {
    testAction(actions.setFirstAdmin, [true], {}, [
      { name: 'SET_ADMIN_EXISTS', payload: [true] }
    ], done)
  })

  it('should dispatch false', (done) => {
    testAction(actions.setFirstAdmin, [false], {}, [
      { name: 'SET_ADMIN_EXISTS', payload: [false] }
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
      { name: 'SET_CURRENT_USER', payload: [null] }
    ], done)
  })
})
