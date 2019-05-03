import Promise from 'bluebird'
import { testAction, testActionPromise } from '../../helper'
import {
  SET_CURRENT_USER,
  SET_TOKEN_VALID,
  DO_LOGIN,
  LOGIN_BY_TOKEN,
  CHECK_FIRST_ADMIN,
  PREPARE_SESSION,
  DO_LOGOUT
} from '../../../../../src/vuex/modules/auth/mutation-types'
import SessionUser from '../../../../../src/models/SessionUser'

let triggerError
const actionsInjector = require('inject-loader!../../../../../src/vuex/modules/auth/actions')
const actions = actionsInjector({
  'vue': {
    prototype: {
      $kuzzle: {
        auth: {
          login() {
            return new Promise((resolve, reject) => {
              if (triggerError.login) {
                reject(new Error('login error'))
              } else {
                resolve({ _id: 'foo', jwt: 'jwt' })
              }
            })
          },
          getCurrentUser() {
            return new Promise((resolve, reject) => {
              if (triggerError.whoAmI) {
                reject(new Error('whoAmI error'))
              } else {
                resolve({ _id: 'foo', jwt: 'jwt', content: { foo: 'bar' } })
              }
            })
          },
          getMyRights() {
            return new Promise((resolve, reject) => {
              if (triggerError.getMyRights) {
                reject(new Error('getMyRights error'))
              } else {
                resolve([
                  {
                    controller: '*',
                    action: '*',
                    index: '*',
                    collection: '*',
                    value: 'allowed'
                  }
                ])
              }
            })
          }
        }
      }
    }
  },
  '../../../services/userCookies': {
    set: sinon.spy(),
    get: sinon.spy(),
    delete: sinon.spy()
  },
  '../../../services/environment': {
    setTokenToCurrentEnvironment: sinon.spy()
  }
})

describe('doLogin action', () => {
  beforeEach(() => {
    triggerError = {
      login: false,
      whoAmI: false,
      getMyRights: false
    }
  })

  it('should catch error if login fail', done => {
    triggerError.login = true
    testActionPromise(
      actions.default[DO_LOGIN],
      { username: 'user', password: 'pwd' },
      {},
      [],
      done
    ).catch(e => {
      expect(e.message).to.equals('login error')
      done()
    })
  })

  it('should catch error if whoAmI fail', done => {
    triggerError.whoAmI = true
    testActionPromise(
      actions.default[DO_LOGIN],
      { username: 'user', password: 'pwd' },
      {},
      [],
      done
    ).catch(e => {
      expect(e.message).to.equals('whoAmI error')
      done()
    })
  })

  it('should catch error if getMyRights fail', done => {
    triggerError.getMyRights = true
    testActionPromise(
      actions.default[DO_LOGIN],
      { username: 'user', password: 'pwd' },
      {},
      [],
      done
    ).catch(e => {
      expect(e.message).to.equals('getMyRights error')
      done()
    })
  })
})

describe('prepareSession action', () => {
  beforeEach(() => {
    triggerError = {
      login: false,
      whoAmI: false,
      getMyRights: false
    }
  })

  it('should store the user, dispatch user and token-valid mutation', done => {
    testActionPromise(
      actions.default[PREPARE_SESSION],
      'jwt',
      {},
      [
        {
          type: SET_CURRENT_USER,
          payload: {
            id: 'foo',
            token: 'jwt',
            params: { foo: 'bar' },
            rights: [
              {
                controller: '*',
                action: '*',
                index: '*',
                collection: '*',
                value: 'allowed'
              }
            ]
          }
        },
        {
          type: SET_TOKEN_VALID,
          payload: true
        }
      ],
      done
    )
  })
})

describe('loginByToken action', () => {
  const loggedUser = {
    id: 'foo',
    token: undefined,
    params: { foo: 'bar' },
    rights: [
      {
        controller: '*',
        action: '*',
        index: '*',
        collection: '*',
        value: 'allowed'
      }
    ]
  }
  const injectMock = (
    userIsValid = true,
    checkTokenError = false,
    whoAmIError = false,
    getMyRightsError = false,
    kuzzleState = 'connecting'
  ) => {
    return actionsInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            protocol: {
              state: kuzzleState
            },
            auth: {
              checkToken: () => {
                if (checkTokenError) {
                  return Promise.reject(new Error('checkToken error'))
                } else {
                  if (userIsValid) {
                    return Promise.resolve({ valid: true })
                  }
      
                  return Promise.resolve({ valid: false })
                }
              },
              getCurrentUser() {
                if (whoAmIError) {
                  return Promise.reject(new Error('whoAmI error'))
                } else {
                  return Promise.resolve({
                    _id: loggedUser.id,
                    content: loggedUser.params
                  })
                }
              },
              getMyRights() {
                if (getMyRightsError) {
                  return Promise.reject(new Error('getMyRights error'))
                } else {
                  return Promise.resolve(loggedUser.rights)
                }
              }
            },
            addListener(type, cb) {
              this.state = 'connected'
              cb()
            },
            removeListener: sinon.stub()
          }
        }
      },
      '../../../services/environment': {
        setTokenToCurrentEnvironment: sinon.stub()
      }
    })
  }

  it('should not log the user if no token is provided', done => {
    let actions = injectMock()
    testActionPromise(
      actions.default[LOGIN_BY_TOKEN],
      {},
      {},
      [
        { type: SET_CURRENT_USER, payload: SessionUser() },
        { type: SET_TOKEN_VALID, payload: false }
      ],
      done
    )
  })

  it('should not login user from cookie because the jwt token is wrong', done => {
    let actions = injectMock(true, true)
    testActionPromise(
      actions.default[LOGIN_BY_TOKEN],
      { token: 'a-token' },
      {},
      [
        { type: SET_CURRENT_USER, payload: SessionUser() },
        { type: SET_TOKEN_VALID, payload: false }
      ]
    ).catch(e => {
      expect(e.message).to.be.equal('checkToken error')
      done()
    })
  })

  it('should do nothing if the token identifies an invalid session', done => {
    let actions = injectMock(false)
    testActionPromise(
      actions.default[LOGIN_BY_TOKEN],
      { token: 'a-token' },
      {},
      [
        { type: SET_CURRENT_USER, payload: SessionUser() },
        { type: SET_TOKEN_VALID, payload: false }
      ],
      done
    ).catch(e => {
      console.log(e)
      done(e)
    })
  })
})

describe('checkFirstAdmin action', () => {
  let kuzzleState = 'connecting'
  let actions

  const injectMock = (exists = true) => {
    actions = actionsInjector({
      'vue': {
        prototype: {
          $kuzzle: {
            protocol: {
              state: kuzzleState
            },
            server: {
              adminExists: () => {
                if (triggerError) {
                  throw new Error('error from Kuzzle')
                }
                return exists
              }
            }
          }
        }
      }
    })
  }

  it('should reject if error comes from Kuzzle', done => {
    triggerError = true
    injectMock()
    testActionPromise(actions.default[CHECK_FIRST_ADMIN], {}, {}, []).catch(
      e => {
        expect(e.message).to.be.equal('error from Kuzzle')
        done()
      }
    )
  })

  it('should dispatch true if admin already exists', done => {
    triggerError = false
    injectMock(true)
    testActionPromise(
      actions.default[CHECK_FIRST_ADMIN],
      null,
      {},
      [{ type: 'SET_ADMIN_EXISTS', payload: true }],
      done
    )
  })

  it('should dispatch false if there is no admin', done => {
    triggerError = false
    injectMock(false)
    testActionPromise(
      actions.default[CHECK_FIRST_ADMIN],
      null,
      {},
      [{ type: 'SET_ADMIN_EXISTS', payload: false }],
      done
    )
  })
})

describe('logout action', () => {
  const actions = actionsInjector({
    'vue': {
      prototype: {
        $kuzzle: {
          auth: {
            logout: sinon.mock()
          }
        }
      }
    },
    '../../../services/userCookies': {
      delete: sinon.mock()
    },
    '../../../services/environment': {
      setTokenToCurrentEnvironment: sinon.spy()
    }
  })

  it('should logout user', done => {
    testAction(
      actions.default[DO_LOGOUT],
      {},
      {},
      [
        { type: SET_CURRENT_USER, payload: SessionUser() },
        { type: SET_TOKEN_VALID, payload: false }
      ],
      done
    )
  })
})
