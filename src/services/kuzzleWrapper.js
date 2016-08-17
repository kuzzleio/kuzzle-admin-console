import kuzzle from './kuzzle'
import { setTokenValid } from '../vuex/modules/auth/actions'
import { setConnection } from '../vuex/modules/common/kuzzle/actions'
import Promise from 'bluebird'

export const isConnected = (timeout = 1000) => {
  if (kuzzle.state !== 'connected') {
    return new Promise((resolve, reject) => {
      // Timeout, if kuzzle doesn't respond in 1s (default) -> reject
      let timeoutId = setTimeout(() => {
        kuzzle.removeListener('connected', id)
        reject(new Error('Kuzzle does not respond'))
      }, timeout)

      let id = kuzzle.addListener('connected', () => {
        clearTimeout(timeoutId)
        kuzzle.removeListener('connected', id)
        resolve()
      })
    })
  }

  return Promise.resolve()
}

export const addDefaultListeners = (store) => {
  kuzzle.removeAllListeners('jwtTokenExpired')
  kuzzle.addListener('jwtTokenExpired', () => {
    setTokenValid(store, false)
  })

  kuzzle.removeAllListeners('disconnected')
  kuzzle.addListener('disconnected', () => {
    setConnection(store, false)
  })

  kuzzle.removeAllListeners('reconnected')
  kuzzle.addListener('reconnected', () => {
    setConnection(store, true)
  })
}
