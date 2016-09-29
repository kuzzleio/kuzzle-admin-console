import Promise from 'bluebird'
import { testAction, testActionPromise } from '../../helper'
import { SET_CURRENT_USER, SET_TOKEN_VALID } from '../../../../../src/vuex/modules/auth/mutation-types'
import SessionUser from '../../../../../src/models/SessionUser'
const actionsInjector = require('inject!../../../../../src/vuex/modules/auth/actions')

describe('doLogin action', () => {
  let triggerError

  const actions = actionsInjector({
    '../../../services/kuzzle': {
      unsetJwtToken () {
        return this
      },
      loginPromise () {
        return new Promise((resolve, reject) => {
          if (triggerError.login) {
            reject(new Error('login error'))
          } else {
            resolve({_id: 'foo', jwt: 'jwt'})
          }
        })
      },
      whoAmIPromise () {
        return new Promise((resolve, reject) => {
          if (triggerError.whoAmI) {
            reject(new Error('whoAmI error'))
          } else {
            resolve({content: {foo: 'bar'}})
          }
        })
      },
      getMyRightsPromise () {
        return new Promise((resolve, reject) => {
          if (triggerError.getMyRights) {
            reject(new Error('getMyRights error'))
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
    triggerError = {
      login: false,
      whoAmI: false,
      getMyRights: false
    }
  })

  it('should catch error if login fail', (done) => {
    triggerError.login = true
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('login error')
      done()
    })
  })

  it('should catch error if whoAmI fail', (done) => {
    triggerError.whoAmI = true
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('whoAmI error')
      done()
    })
  })

  it('should catch error if getMyRights fail', (done) => {
    triggerError.getMyRights = true
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [], done).catch(e => {
      expect(e.message).to.equals('getMyRights error')
      done()
    })
  })

  it('should store the user, dispatch user and token-valid mutation', (done) => {
    testActionPromise(actions.doLogin, ['user', 'pwd'], {}, [
      {
        name: SET_CURRENT_USER,
        payload: [{
          id: 'foo',
          token: 'jwt',
          params: {foo: 'bar'},
          rights: [{controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'}]
        }]
      },
      {
        name: SET_TOKEN_VALID,
        payload: [true]
      }
    ], done)
  })
})

describe('loginFromCookie action', () => {
  let kuzzleState = 'connecting'
  let actions

  const loggedUser = {
    id: 'foo',
    token: 'jwt',
    params: {foo: 'bar'},
    rights: [{controller: '*', action: '*', index: '*', collection: '*', value: 'allowed'}]
  }

  const injectMock = (userInCookie, userIsValid = true, triggerError = false) => {
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
        unsetJwtToken: sinon.mock(),
        addListener (type, cb) {
          this.state = 'connected'
          cb()
        },
        removeListener: sinon.mock()
      },
      '../../../services/userCookies': {
        get () {
          return userInCookie
        }
      }
    })
  }

  it('should login user from cookie', (done) => {
    injectMock(loggedUser)
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: SET_CURRENT_USER, payload: [loggedUser] }
    ], done)
  })

  it('should not login user from cookie because the jwt token is wrong', (done) => {
    injectMock(loggedUser, true, true)
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: SET_CURRENT_USER, payload: [SessionUser()] }
    ])
    .catch((e) => {
      expect(e.message).to.be.equal('error from Kuzzle')
      done()
    })
  })

  it('should resolve null and do nothing if there is no user', (done) => {
    injectMock(null)
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: SET_CURRENT_USER, payload: [SessionUser()] }
    ], done)
  })

  it('should resolve null and do nothing if there is user in cookie but with bad token', (done) => {
    injectMock(loggedUser, false)
    testActionPromise(actions.loginFromCookie, [], {}, [
      { name: SET_CURRENT_USER, payload: [SessionUser()] }
    ], done)
  })
})

describe('checkFirstAdmin action', () => {
  let kuzzleState = 'connecting'
  let triggerError = false
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
              return Promise.resolve({result: {exists: true}})
            }

            return Promise.resolve({result: {exists: false}})
          }
        },
        unsetJwtToken: sinon.spy()
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
      logout: sinon.mock(),
      unsetJwtToken: sinon.mock()
    },
    '../../../services/userCookies': {
      delete: sinon.mock()
    },
    '../../../services/router': {
      go: sinon.mock()
    }
  })

  it('should logout user', (done) => {
    testAction(actions.doLogout, [], {}, [
      { name: SET_CURRENT_USER, payload: [SessionUser()] },
      { name: SET_TOKEN_VALID, payload: [false] }
    ], done)
  })
})

describe('setTokenValid', () => {
  const actions = actionsInjector({})

  it('should dispatch event with true', (done) => {
    testAction(actions.setTokenValid, [true], {}, [
      { name: SET_TOKEN_VALID, payload: [true] }
    ], done)
  })

  it('should dispatch event with false', (done) => {
    testAction(actions.setTokenValid, [false], {}, [
      { name: SET_TOKEN_VALID, payload: [false] }
    ], done)
  })
})
